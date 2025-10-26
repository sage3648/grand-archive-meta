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

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

clear

echo -e "${CYAN}"
cat << "EOF"
   ____                     _        _             _     _
  / ___|_ __ __ _ _ __   __| |      / \   _ __ ___| |__ (_)_   _____
 | |  _| '__/ _` | '_ \ / _` |     / _ \ | '__/ __| '_ \| \ \ / / _ \
 | |_| | | | (_| | | | | (_| |    / ___ \| | | (__| | | | |\ V /  __/
  \____|_|  \__,_|_| |_|\__,_|   /_/   \_\_|  \___|_| |_|_| \_/ \___|

  __  __      _          __     __        _  __
 |  \/  | ___| |_ __ _   \ \   / /__ _ __(_)/ _|_   _
 | |\/| |/ _ \ __/ _` |   \ \ / / _ \ '__| | |_| | | |
 | |  | |  __/ || (_| |    \ V /  __/ |  | |  _| |_| |
 |_|  |_|\___|\__\__,_|     \_/ \___|_|  |_|_|  \__, |
                                                 |___/
EOF
echo -e "${NC}"

echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}   System Health Check${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backend Health Check
echo -e "${BOLD}Backend Service${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if backend is running
echo -n "Backend process... "
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on port 8080"
    ((CHECKS_PASSED++))

    # Check health endpoint
    echo -n "Health endpoint... "
    HEALTH_RESPONSE=$(curl -s -f http://localhost:8080/api/health 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC} Responding"
        ((CHECKS_PASSED++))

        # Parse health response
        STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        DB_STATUS=$(echo "$HEALTH_RESPONSE" | grep -o '"database":"[^"]*"' | cut -d'"' -f4)

        echo -n "API status... "
        if [ "$STATUS" == "healthy" ]; then
            echo -e "${GREEN}✓${NC} Healthy"
            ((CHECKS_PASSED++))
        else
            echo -e "${RED}✗${NC} Unhealthy: $STATUS"
            ((CHECKS_FAILED++))
        fi

        echo -n "Database connection... "
        if [ "$DB_STATUS" == "connected" ]; then
            echo -e "${GREEN}✓${NC} Connected"
            ((CHECKS_PASSED++))
        else
            echo -e "${RED}✗${NC} Not connected: $DB_STATUS"
            ((CHECKS_FAILED++))
        fi
    else
        echo -e "${RED}✗${NC} Not responding"
        ((CHECKS_FAILED++))
    fi

    # Test API endpoints
    echo -n "Meta endpoint... "
    if curl -s -f http://localhost:8080/api/meta/format/Constructed >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Responding"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Not responding (may not have data yet)"
        ((CHECKS_WARNING++))
    fi

    echo -n "Decklists endpoint... "
    if curl -s -f "http://localhost:8080/api/decklists?limit=1" >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Responding"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Not responding (may not have data yet)"
        ((CHECKS_WARNING++))
    fi

else
    echo -e "${RED}✗${NC} Not running"
    echo -e "  Start with: ${CYAN}cd backend && ./run-local.sh${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Frontend Health Check
echo -e "${BOLD}Frontend Service${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if frontend is running
echo -n "Frontend process... "
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Running on port 3000"
    ((CHECKS_PASSED++))

    # Check if frontend is responding
    echo -n "Frontend responding... "
    if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Responding"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Not responding"
        ((CHECKS_FAILED++))
    fi

    # Check key pages
    echo -n "Dashboard page... "
    if curl -s -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Accessible"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Not accessible"
        ((CHECKS_FAILED++))
    fi

    echo -n "Meta page... "
    if curl -s -f http://localhost:3000/meta >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Accessible"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Not accessible"
        ((CHECKS_WARNING++))
    fi

else
    echo -e "${RED}✗${NC} Not running"
    echo -e "  Start with: ${CYAN}cd frontend && ./run-local.sh${NC}"
    ((CHECKS_FAILED++))
fi

echo ""

# Configuration Check
echo -e "${BOLD}Configuration${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Backend .env... "
if [ -f "$SCRIPT_DIR/backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Exists"
    ((CHECKS_PASSED++))

    # Check MongoDB URI is set
    echo -n "MongoDB URI configured... "
    MONGODB_URI=$(grep "^MONGODB_URI=" "$SCRIPT_DIR/backend/.env" | cut -d '=' -f2-)
    if [ -n "$MONGODB_URI" ] && [ "$MONGODB_URI" != "mongodb+srv://username:password@cluster.mongodb.net/" ]; then
        echo -e "${GREEN}✓${NC} Configured"
        ((CHECKS_PASSED++))
    else
        echo -e "${YELLOW}⚠${NC} Using example value"
        ((CHECKS_WARNING++))
    fi
else
    echo -e "${RED}✗${NC} Missing"
    ((CHECKS_FAILED++))
fi

echo -n "Frontend .env.local... "
if [ -f "$SCRIPT_DIR/frontend/.env.local" ]; then
    echo -e "${GREEN}✓${NC} Exists"
    ((CHECKS_PASSED++))

    # Check API URL is set
    echo -n "API URL configured... "
    API_URL=$(grep "^NEXT_PUBLIC_API_URL=" "$SCRIPT_DIR/frontend/.env.local" | cut -d '=' -f2-)
    if [ -n "$API_URL" ]; then
        echo -e "${GREEN}✓${NC} $API_URL"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} Not set"
        ((CHECKS_FAILED++))
    fi
else
    echo -e "${RED}✗${NC} Missing"
    ((CHECKS_FAILED++))
fi

echo ""

# Database Data Check
echo -e "${BOLD}Database Data${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $CHECKS_FAILED -eq 0 ]; then
    # Try to get some stats from the API
    echo -n "Events in database... "
    EVENTS_RESPONSE=$(curl -s http://localhost:8080/api/events 2>/dev/null)
    if [ $? -eq 0 ]; then
        # Count events (this is a simplistic check)
        EVENT_COUNT=$(echo "$EVENTS_RESPONSE" | grep -o '"id"' | wc -l | tr -d ' ')
        if [ "$EVENT_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✓${NC} $EVENT_COUNT events found"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} No events yet (crawler needs to run)"
            ((CHECKS_WARNING++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Cannot check"
        ((CHECKS_WARNING++))
    fi

    echo -n "Champions in database... "
    CHAMPIONS_RESPONSE=$(curl -s http://localhost:8080/api/champions 2>/dev/null)
    if [ $? -eq 0 ]; then
        CHAMPION_COUNT=$(echo "$CHAMPIONS_RESPONSE" | grep -o '"name"' | wc -l | tr -d ' ')
        if [ "$CHAMPION_COUNT" -gt 0 ]; then
            echo -e "${GREEN}✓${NC} $CHAMPION_COUNT champions found"
            ((CHECKS_PASSED++))
        else
            echo -e "${YELLOW}⚠${NC} No champions yet (crawler needs to run)"
            ((CHECKS_WARNING++))
        fi
    else
        echo -e "${YELLOW}⚠${NC} Cannot check"
        ((CHECKS_WARNING++))
    fi
fi

echo ""

# System Resources
echo -e "${BOLD}System Resources${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -n "Available disk space... "
AVAILABLE_GB=$(df -h "$SCRIPT_DIR" | awk 'NR==2 {print $4}')
echo -e "${GREEN}✓${NC} $AVAILABLE_GB"
((CHECKS_PASSED++))

echo -n "Memory usage... "
MEMORY_USAGE=$(ps aux | awk '{sum+=$4} END {printf "%.1f%%", sum}')
echo -e "${GREEN}✓${NC} $MEMORY_USAGE of system memory in use"
((CHECKS_PASSED++))

# Backend process memory
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    BACKEND_PID=$(lsof -Pi :8080 -sTCP:LISTEN -t | head -1)
    BACKEND_MEM=$(ps -p $BACKEND_PID -o %mem | tail -1 | tr -d ' ')
    echo -n "Backend memory... "
    echo -e "${GREEN}✓${NC} ${BACKEND_MEM}%"
    ((CHECKS_PASSED++))
fi

# Frontend process memory
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    FRONTEND_PID=$(lsof -Pi :3000 -sTCP:LISTEN -t | head -1)
    FRONTEND_MEM=$(ps -p $FRONTEND_PID -o %mem | tail -1 | tr -d ' ')
    echo -n "Frontend memory... "
    echo -e "${GREEN}✓${NC} ${FRONTEND_MEM}%"
    ((CHECKS_PASSED++))
fi

echo ""

# Summary
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${BLUE}   Summary${NC}"
echo -e "${BOLD}${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  ${GREEN}Passed:${NC}   $CHECKS_PASSED"
echo -e "  ${YELLOW}Warnings:${NC} $CHECKS_WARNING"
echo -e "  ${RED}Failed:${NC}   $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ] && [ $CHECKS_WARNING -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${GREEN}   🎉 Everything looks great!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Your development environment is fully operational."
    echo ""
    echo -e "${BOLD}Quick Links:${NC}"
    echo -e "  Frontend:   ${CYAN}http://localhost:3000${NC}"
    echo -e "  Backend:    ${CYAN}http://localhost:8080/api${NC}"
    echo -e "  Health:     ${CYAN}http://localhost:8080/api/health${NC}"
    echo ""
elif [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${YELLOW}   ⚠ System operational with warnings${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Your system is running but some non-critical issues were found."
    echo -e "Review the warnings above for more details."
    echo ""
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${RED}   ✗ Issues detected${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "Some critical checks failed. Common solutions:"
    echo ""
    echo -e "  ${CYAN}1.${NC} Services not running:"
    echo -e "     ${CYAN}./start-dev.sh${NC}"
    echo ""
    echo -e "  ${CYAN}2.${NC} Configuration missing:"
    echo -e "     ${CYAN}./setup.sh${NC}"
    echo ""
    echo -e "  ${CYAN}3.${NC} Database issues:"
    echo -e "     Check backend/.env MongoDB URI"
    echo ""
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

exit $CHECKS_FAILED
