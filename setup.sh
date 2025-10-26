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

clear

echo -e "${CYAN}"
cat << "EOF"
   ____                     _        _             _     _
  / ___|_ __ __ _ _ __   __| |      / \   _ __ ___| |__ (_)_   _____
 | |  _| '__/ _` | '_ \ / _` |     / _ \ | '__/ __| '_ \| \ \ / / _ \
 | |_| | | | (_| | | | | (_| |    / ___ \| | | (__| | | | |\ V /  __/
  \____|_|  \__,_|_| |_|\__,_|   /_/   \_\_|  \___|_| |_|_| \_/ \___|

  __  __      _          ____       _
 |  \/  | ___| |_ __ _  / ___|  ___| |_ _   _ _ __
 | |\/| |/ _ \ __/ _` | \___ \ / _ \ __| | | | '_ \
 | |  | |  __/ || (_| |  ___) |  __/ |_| |_| | |_) |
 |_|  |_|\___|\__\__,_| |____/ \___|\__|\__,_| .__/
                                              |_|
EOF
echo -e "${NC}"

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}   Local Development Setup${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "This script will set up your local development environment."
echo -e "Estimated time: ${CYAN}5-10 minutes${NC}"
echo ""

# Step 1: Check Prerequisites
echo -e "${BOLD}${BLUE}Step 1/5:${NC} ${BOLD}Checking Prerequisites${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -f "scripts/check-prerequisites.sh" ]; then
    bash scripts/check-prerequisites.sh
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}Setup cannot continue due to missing prerequisites.${NC}"
        echo -e "Please install the required software and run setup again."
        exit 1
    fi
else
    echo -e "${RED}✗ scripts/check-prerequisites.sh not found${NC}"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
clear

# Step 2: Backend Setup
echo -e "${BOLD}${BLUE}Step 2/5:${NC} ${BOLD}Backend Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$SCRIPT_DIR/backend"

# Create .env from example if it doesn't exist
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo -e "${BLUE}Creating backend/.env from template...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✓${NC} Created backend/.env"
        echo ""
        echo -e "${YELLOW}⚠ IMPORTANT: Configure MongoDB connection${NC}"
        echo -e "  Edit ${CYAN}backend/.env${NC} and set your MongoDB URI:"
        echo ""
        echo -e "  ${CYAN}MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/${NC}"
        echo ""
        read -p "Press Enter when ready, or Ctrl+C to exit and configure manually..."

        # Optionally open in default editor
        echo ""
        read -p "Open .env in editor now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        echo -e "${RED}✗ backend/.env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} backend/.env already exists"
fi

echo ""
echo -e "${BLUE}Installing backend dependencies and building...${NC}"
echo -e "  ${YELLOW}This may take a few minutes on first run...${NC}"
echo ""

if cargo build; then
    echo ""
    echo -e "${GREEN}✓${NC} Backend built successfully"
else
    echo ""
    echo -e "${RED}✗ Backend build failed${NC}"
    echo -e "  Check the errors above and try running: ${CYAN}cd backend && cargo build${NC}"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
clear

# Step 3: Frontend Setup
echo -e "${BOLD}${BLUE}Step 3/5:${NC} ${BOLD}Frontend Setup${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$SCRIPT_DIR/frontend"

# Create .env.local from example if it doesn't exist
if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        echo -e "${BLUE}Creating frontend/.env.local from template...${NC}"
        cp .env.local.example .env.local
        echo -e "${GREEN}✓${NC} Created frontend/.env.local"
    else
        echo -e "${RED}✗ frontend/.env.local.example not found${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} frontend/.env.local already exists"
fi

echo ""
echo -e "${BLUE}Installing frontend dependencies...${NC}"
echo -e "  ${YELLOW}This may take a few minutes...${NC}"
echo ""

if npm install; then
    echo ""
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo ""
    echo -e "${RED}✗ npm install failed${NC}"
    exit 1
fi

echo ""
read -p "Press Enter to continue..."
clear

# Step 4: Verify Installation
echo -e "${BOLD}${BLUE}Step 4/5:${NC} ${BOLD}Verifying Installation${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$SCRIPT_DIR"

# Check backend build artifacts
echo -n "Backend build artifacts... "
if [ -d "backend/target/debug" ] || [ -d "backend/target/release" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Check frontend node_modules
echo -n "Frontend dependencies... "
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

# Check environment files
echo -n "Backend configuration... "
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo -n "Frontend configuration... "
if [ -f "frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
fi

echo ""
read -p "Press Enter to continue..."
clear

# Step 5: Next Steps
echo -e "${BOLD}${BLUE}Step 5/5:${NC} ${BOLD}Setup Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}✓ Setup completed successfully!${NC}"
echo ""
echo -e "${BOLD}Next Steps:${NC}"
echo ""
echo -e "  ${CYAN}1.${NC} Start both backend and frontend:"
echo -e "     ${CYAN}./start-dev.sh${NC}"
echo ""
echo -e "  ${CYAN}2.${NC} Or start them individually:"
echo -e "     ${CYAN}cd backend && ./run-local.sh${NC}    ${YELLOW}# Terminal 1${NC}"
echo -e "     ${CYAN}cd frontend && ./run-local.sh${NC}   ${YELLOW}# Terminal 2${NC}"
echo ""
echo -e "  ${CYAN}3.${NC} Verify everything is working:"
echo -e "     ${CYAN}./verify.sh${NC}"
echo ""
echo -e "${BOLD}URLs:${NC}"
echo -e "  Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "  Backend:  ${GREEN}http://localhost:8080/api${NC}"
echo -e "  Health:   ${GREEN}http://localhost:8080/api/health${NC}"
echo ""
echo -e "${BOLD}Documentation:${NC}"
echo -e "  ${CYAN}cat GETTING_STARTED.md${NC}    - Complete getting started guide"
echo -e "  ${CYAN}cat DEVELOPMENT.md${NC}        - Development guidelines"
echo -e "  ${CYAN}cat API.md${NC}                - API documentation"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${GREEN}Happy coding!${NC}"
echo ""
