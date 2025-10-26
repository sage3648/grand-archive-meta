#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Grand Archive Meta - Frontend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}✗ .env.local file not found${NC}"
    echo -e "  Run ${BLUE}../setup.sh${NC} first or copy .env.local.example to .env.local"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found${NC}"
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}✗ npm install failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    echo ""
fi

# Check if port is available
PORT=${PORT:-3000}
echo -n "Checking port $PORT... "
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Port $PORT is in use"
    echo ""
    echo "Process using port $PORT:"
    lsof -Pi :$PORT -sTCP:LISTEN
    echo ""
    read -p "Kill process and continue? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t)
        kill -9 $PID
        echo -e "${GREEN}✓${NC} Process killed"
    else
        echo -e "${RED}Exiting...${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC}"
fi

# Check backend connection
echo -n "Checking backend connection... "
BACKEND_URL=$(grep "^NEXT_PUBLIC_API_URL=" .env.local | cut -d '=' -f2)
if [ -z "$BACKEND_URL" ]; then
    echo -e "${YELLOW}⚠${NC} NEXT_PUBLIC_API_URL not set in .env.local"
else
    # Extract just the base URL (remove /api if present)
    BASE_URL=$(echo "$BACKEND_URL" | sed 's|/api.*||')
    if curl -s -f "$BASE_URL/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend is running"
    else
        echo -e "${YELLOW}⚠${NC} Backend not responding"
        echo -e "  Make sure backend is running: ${BLUE}cd ../backend && ./run-local.sh${NC}"
        echo ""
        read -p "Continue anyway? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Start the development server
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Starting frontend development server...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Frontend: ${GREEN}http://localhost:$PORT${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run the development server
npm run dev
