#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# PID file locations
BACKEND_PID_FILE="/tmp/grand-archive-backend.pid"
FRONTEND_PID_FILE="/tmp/grand-archive-frontend.pid"

# Log file locations
LOG_DIR="$SCRIPT_DIR/logs"
BACKEND_LOG="$LOG_DIR/backend.log"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# Create logs directory
mkdir -p "$LOG_DIR"

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping services...${NC}"

    # Kill backend
    if [ -f "$BACKEND_PID_FILE" ]; then
        BACKEND_PID=$(cat "$BACKEND_PID_FILE")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            echo -e "${BLUE}Stopping backend (PID: $BACKEND_PID)...${NC}"
            kill $BACKEND_PID
            # Also kill cargo run children
            pkill -P $BACKEND_PID 2>/dev/null
        fi
        rm -f "$BACKEND_PID_FILE"
    fi

    # Kill frontend
    if [ -f "$FRONTEND_PID_FILE" ]; then
        FRONTEND_PID=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            echo -e "${BLUE}Stopping frontend (PID: $FRONTEND_PID)...${NC}"
            kill $FRONTEND_PID
            # Also kill npm run children
            pkill -P $FRONTEND_PID 2>/dev/null
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi

    # Clean up any remaining processes on ports
    BACKEND_PORT_PID=$(lsof -ti:8080)
    if [ ! -z "$BACKEND_PORT_PID" ]; then
        kill -9 $BACKEND_PORT_PID 2>/dev/null
    fi

    FRONTEND_PORT_PID=$(lsof -ti:3000)
    if [ ! -z "$FRONTEND_PORT_PID" ]; then
        kill -9 $FRONTEND_PORT_PID 2>/dev/null
    fi

    echo -e "${GREEN}✓ All services stopped${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

clear

echo -e "${CYAN}"
cat << "EOF"
   ____                     _        _             _     _
  / ___|_ __ __ _ _ __   __| |      / \   _ __ ___| |__ (_)_   _____
 | |  _| '__/ _` | '_ \ / _` |     / _ \ | '__/ __| '_ \| \ \ / / _ \
 | |_| | | | (_| | | | | (_| |    / ___ \| | | (__| | | | |\ V /  __/
  \____|_|  \__,_|_| |_|\__,_|   /_/   \_\_|  \___|_| |_|_| \_/ \___|

  __  __      _
 |  \/  | ___| |_ __ _
 | |\/| |/ _ \ __/ _` |
 | |  | |  __/ || (_| |
 |_|  |_|\___|\__\__,_|
EOF
echo -e "${NC}"

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}   Development Server Startup${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if setup has been run
if [ ! -f "backend/.env" ] || [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠ Setup not complete${NC}"
    echo -e "  Run ${CYAN}./setup.sh${NC} first"
    exit 1
fi

# Check if ports are available
echo -e "${BLUE}Checking ports...${NC}"
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}✗ Port 8080 is already in use${NC}"
    echo "  Kill the process and try again, or run services individually"
    exit 1
fi
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${RED}✗ Port 3000 is already in use${NC}"
    echo "  Kill the process and try again, or run services individually"
    exit 1
fi
echo -e "${GREEN}✓ Ports available${NC}"
echo ""

# Start backend
echo -e "${BOLD}${BLUE}Starting Backend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$SCRIPT_DIR/backend"
cargo build >/dev/null 2>&1 &
BUILD_PID=$!

echo -n "Building backend... "
wait $BUILD_PID
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Check $BACKEND_LOG for details"
    exit 1
fi

# Start backend in background
export $(grep -v '^#' .env | xargs)
nohup cargo run > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > "$BACKEND_PID_FILE"

echo -e "Backend PID: ${CYAN}$BACKEND_PID${NC}"
echo -e "Backend log: ${CYAN}$BACKEND_LOG${NC}"

# Wait for backend to be ready
echo -n "Waiting for backend to start... "
MAX_WAIT=30
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s -f http://localhost:8080/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    sleep 1
    WAITED=$((WAITED + 1))
    echo -n "."
done

if [ $WAITED -eq $MAX_WAIT ]; then
    echo -e "${RED}✗${NC}"
    echo "Backend failed to start. Check logs:"
    echo "  tail -f $BACKEND_LOG"
    cleanup
fi

echo ""

# Start frontend
echo -e "${BOLD}${BLUE}Starting Frontend...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$SCRIPT_DIR/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies... "
    npm install
fi

# Start frontend in background
nohup npm run dev > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$FRONTEND_PID_FILE"

echo -e "Frontend PID: ${CYAN}$FRONTEND_PID${NC}"
echo -e "Frontend log: ${CYAN}$FRONTEND_LOG${NC}"

# Wait for frontend to be ready
echo -n "Waiting for frontend to start... "
MAX_WAIT=60
WAITED=0
while [ $WAITED -lt $MAX_WAIT ]; do
    if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        break
    fi
    sleep 1
    WAITED=$((WAITED + 1))
    if [ $((WAITED % 10)) -eq 0 ]; then
        echo -n " ${WAITED}s "
    else
        echo -n "."
    fi
done

if [ $WAITED -eq $MAX_WAIT ]; then
    echo -e "${RED}✗${NC}"
    echo "Frontend failed to start. Check logs:"
    echo "  tail -f $FRONTEND_LOG"
    cleanup
fi

echo ""

# Success message
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${GREEN}   Services Running!${NC}"
echo -e "${BOLD}${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BOLD}URLs:${NC}"
echo -e "  Frontend:   ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:    ${GREEN}http://localhost:8080/api${NC}"
echo -e "  Health:     ${GREEN}http://localhost:8080/api/health${NC}"
echo ""
echo -e "${BOLD}Logs:${NC}"
echo -e "  Backend:    ${CYAN}tail -f $BACKEND_LOG${NC}"
echo -e "  Frontend:   ${CYAN}tail -f $FRONTEND_LOG${NC}"
echo ""
echo -e "${BOLD}Process IDs:${NC}"
echo -e "  Backend:    ${CYAN}$BACKEND_PID${NC}"
echo -e "  Frontend:   ${CYAN}$FRONTEND_PID${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Follow logs
echo -e "${BOLD}Combined Logs:${NC}"
echo ""

# Show combined logs from both services
tail -f "$BACKEND_LOG" "$FRONTEND_LOG" &
TAIL_PID=$!

# Wait for Ctrl+C
wait $TAIL_PID
