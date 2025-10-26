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
echo -e "${BLUE}   Grand Archive Meta - Backend Server${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo -e "  Run ${BLUE}../setup.sh${NC} first or copy .env.example to .env"
    exit 1
fi

# Load environment variables
echo -e "${BLUE}Loading environment variables...${NC}"
export $(grep -v '^#' .env | xargs)

# Check MongoDB connection
echo -n "Checking MongoDB connection... "
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}✗${NC}"
    echo -e "${RED}MONGODB_URI not set in .env${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC}"

# Check if port is available
PORT=${PORT:-8080}
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

# Build mode selection
echo ""
echo "Select build mode:"
echo "  1) Debug (faster compilation, with debug symbols)"
echo "  2) Release (optimized, slower compilation)"
read -p "Enter choice [1]: " BUILD_MODE
BUILD_MODE=${BUILD_MODE:-1}

if [ "$BUILD_MODE" == "2" ]; then
    BUILD_FLAG="--release"
    BUILD_TYPE="release"
    echo -e "${BLUE}Building in release mode...${NC}"
else
    BUILD_FLAG=""
    BUILD_TYPE="debug"
    echo -e "${BLUE}Building in debug mode...${NC}"
fi

# Build the project
echo ""
echo -e "${BLUE}Building backend...${NC}"
if cargo build $BUILD_FLAG; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Start the server
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Starting backend server...${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  API URL: ${GREEN}http://localhost:$PORT/api${NC}"
echo -e "  Health:  ${GREEN}http://localhost:$PORT/api/health${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Run the server
cargo run $BUILD_FLAG
