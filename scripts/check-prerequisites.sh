#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Grand Archive Meta - Prerequisites Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to compare versions
version_gte() {
    [ "$1" = "$(echo -e "$1\n$2" | sort -V | tail -n1)" ]
}

# Check Rust
echo -n "Checking Rust installation... "
if command_exists rustc; then
    RUST_VERSION=$(rustc --version | awk '{print $2}')
    echo -e "${GREEN}✓${NC} Found: $RUST_VERSION"
    ((CHECKS_PASSED++))

    # Check cargo
    echo -n "Checking Cargo... "
    if command_exists cargo; then
        CARGO_VERSION=$(cargo --version | awk '{print $2}')
        echo -e "${GREEN}✓${NC} Found: $CARGO_VERSION"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Not found"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Not found"
    echo -e "${YELLOW}  Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh${NC}"
    ((CHECKS_FAILED++))
fi

# Check Node.js
echo -n "Checking Node.js installation... "
if command_exists node; then
    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_NODE="20.0.0"

    if version_gte "$NODE_VERSION" "$REQUIRED_NODE"; then
        echo -e "${GREEN}✓${NC} Found: v$NODE_VERSION"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Found: v$NODE_VERSION (recommended: v20.x or higher)"
        ((CHECKS_WARNING++))
    fi
else
    echo -e "${RED}✗${NC} Not found"
    echo -e "${YELLOW}  Install: brew install node${NC}"
    ((CHECKS_FAILED++))
fi

# Check npm
echo -n "Checking npm... "
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found: $NPM_VERSION"
    ((CHECKS_PASSED++))
else
    echo -e "${RED}✗${NC} Not found"
    ((CHECKS_FAILED++))
fi

# Check MongoDB connection
echo -n "Checking MongoDB connection... "
if [ -f "/Users/sage/Programming/grand-archive-meta/backend/.env" ]; then
    # Extract MongoDB URI from .env file
    MONGODB_URI=$(grep "^MONGODB_URI=" "/Users/sage/Programming/grand-archive-meta/backend/.env" | cut -d '=' -f2-)

    if [ -n "$MONGODB_URI" ]; then
        # Check if mongosh is available for testing connection
        if command_exists mongosh; then
            # Try to connect (with 5 second timeout)
            if timeout 5 mongosh "$MONGODB_URI" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
                echo -e "${GREEN}✓${NC} Connected successfully"
                ((CHECKS_PASSED++))
            else
                echo -e "${YELLOW}⚠${NC} Cannot connect (connection may work at runtime)"
                echo -e "${YELLOW}  URI configured in backend/.env${NC}"
                ((CHECKS_WARNING++))
            fi
        else
            echo -e "${YELLOW}⚠${NC} Cannot verify (mongosh not installed)"
            echo -e "${YELLOW}  URI configured in backend/.env${NC}"
            ((CHECKS_WARNING++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Not configured in backend/.env"
        ((CHECKS_WARNING++))
    fi
else
    echo -e "${YELLOW}⚠${NC} backend/.env not found"
    echo -e "${YELLOW}  Will be created during setup${NC}"
    ((CHECKS_WARNING++))
fi

# Check for required ports
echo ""
echo -e "${BLUE}Checking required ports...${NC}"

check_port() {
    local PORT=$1
    local SERVICE=$2

    echo -n "  Port $PORT ($SERVICE)... "
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠${NC} In use"
        lsof -Pi :$PORT -sTCP:LISTEN | tail -n +2
        ((CHECKS_WARNING++))
    else
        echo -e "${GREEN}✓${NC} Available"
        ((CHECKS_PASSED++))
    fi
}

check_port 8080 "Backend"
check_port 3000 "Frontend"

# Check disk space
echo ""
echo -n "Checking disk space... "
AVAILABLE_GB=$(df -h . | awk 'NR==2 {print $4}' | sed 's/Gi*//')
if [ "${AVAILABLE_GB%%.*}" -gt 5 ]; then
    echo -e "${GREEN}✓${NC} ${AVAILABLE_GB} available"
    ((CHECKS_PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Only ${AVAILABLE_GB} available (recommended: >5GB)"
    ((CHECKS_WARNING++))
fi

# Summary
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  ${GREEN}Passed:${NC}   $CHECKS_PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $CHECKS_WARNING"
echo -e "  ${RED}Failed:${NC}   $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical prerequisites met!${NC}"
    echo -e "  Run ${BLUE}./setup.sh${NC} to set up the project"
    exit 0
else
    echo -e "${RED}✗ Some prerequisites are missing${NC}"
    echo -e "  Please install missing dependencies and try again"
    exit 1
fi
