# Getting Started with Grand Archive Meta

Welcome! This guide will help you get the Grand Archive Meta webapp running on your local machine in under 10 minutes.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Setup Guide](#detailed-setup-guide)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Overview

Grand Archive Meta is a full-stack web application for tracking and analyzing Grand Archive TCG tournament data. The stack consists of:

- **Backend**: Rust + Actix Web + MongoDB
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Database**: MongoDB Atlas (shared with FAB TCG Meta)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │────▶│   Backend       │────▶│   MongoDB       │
│   Next.js       │     │   Rust/Actix    │     │   Atlas         │
│   :3000         │     │   :8080         │     │                 │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Prerequisites

### Required Software

Before you begin, you need to install:

1. **Rust** (latest stable version)
   ```bash
   # Install Rust via rustup
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

   # Verify installation
   rustc --version
   cargo --version
   ```

2. **Node.js** (version 20.x or higher)
   ```bash
   # macOS (using Homebrew)
   brew install node

   # Verify installation
   node --version  # Should be v20.x.x or higher
   npm --version
   ```

3. **MongoDB Access**
   - You need MongoDB Atlas credentials
   - The project uses a shared cluster with FAB TCG Meta
   - Contact the maintainer if you don't have credentials

### Optional Tools

These are helpful but not required:

- **MongoDB Compass**: GUI for browsing database
- **Visual Studio Code**: Recommended code editor
- **Rust Analyzer**: VS Code extension for Rust

## Quick Start

If you're comfortable with development and have all prerequisites installed:

```bash
# 1. Clone the repository (if you haven't already)
cd /Users/sage/Programming/grand-archive-meta

# 2. Run setup script
./setup.sh

# 3. Start both services
./start-dev.sh

# 4. Verify everything is working
./verify.sh
```

That's it! Open http://localhost:3000 in your browser.

## Detailed Setup Guide

### Step 1: Check Prerequisites

Before running setup, verify you have everything installed:

```bash
./scripts/check-prerequisites.sh
```

This script will check for:
- ✓ Rust and Cargo
- ✓ Node.js and npm
- ✓ MongoDB connection
- ✓ Available ports (3000, 8080)
- ✓ Sufficient disk space

**What the output looks like:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Grand Archive Meta - Prerequisites Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Checking Rust installation... ✓ Found: 1.75.0
Checking Cargo... ✓ Found: 1.75.0
Checking Node.js installation... ✓ Found: v20.11.0
Checking npm... ✓ Found: 10.2.4
Checking MongoDB connection... ⚠ Cannot verify (will work at runtime)

Summary
  Passed:   8
  Warnings: 1
  Failed:   0

✓ All critical prerequisites met!
  Run ./setup.sh to set up the project
```

### Step 2: Run Setup

The setup script will configure everything automatically:

```bash
./setup.sh
```

**What happens during setup:**

1. **Prerequisites Check** (30 seconds)
   - Verifies all required software is installed
   - Checks port availability

2. **Backend Setup** (2-5 minutes)
   - Creates `backend/.env` from template
   - Prompts for MongoDB configuration
   - Compiles Rust backend (first compile takes longer)
   - Creates all necessary indexes

3. **Frontend Setup** (2-3 minutes)
   - Creates `frontend/.env.local` from template
   - Installs npm dependencies
   - Prepares Next.js environment

4. **Verification** (10 seconds)
   - Checks all configuration files
   - Verifies build artifacts

**Setup completion screen:**

```
Step 5/5: Setup Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Setup completed successfully!

Next Steps:

  1. Start both backend and frontend:
     ./start-dev.sh

  2. Or start them individually:
     cd backend && ./run-local.sh    # Terminal 1
     cd frontend && ./run-local.sh   # Terminal 2

  3. Verify everything is working:
     ./verify.sh

URLs:
  Frontend: http://localhost:3000
  Backend:  http://localhost:8080/api
  Health:   http://localhost:8080/api/health
```

### Step 3: Configure MongoDB

During setup, you'll be prompted to configure MongoDB. You have two options:

**Option A: Edit during setup**

The setup script will pause and let you edit the `.env` file:

```bash
# In backend/.env, set your MongoDB URI:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=grand-archive-meta
```

**Option B: Edit manually after setup**

```bash
# Open the file in your editor
nano backend/.env
# or
code backend/.env

# Set the MongoDB URI
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster.mongodb.net/grand-archive-meta
```

**Important**: Replace `username` and `password` with your actual MongoDB credentials.

## Running the Application

You have three ways to run the application:

### Method 1: Start Everything Together (Recommended)

This is the easiest way for daily development:

```bash
./start-dev.sh
```

This script will:
- Build and start the backend on port 8080
- Start the frontend on port 3000
- Show combined logs from both services
- Allow you to stop both with Ctrl+C

**What you'll see:**

```
   ____                     _        _             _     _
  / ___|_ __ __ _ _ __   __| |      / \   _ __ ___| |__ (_)_   _____
 | |  _| '__/ _` | '_ \ / _` |     / _ \ | '__/ __| '_ \| \ \ / / _ \
 | |_| | | | (_| | | | | (_| |    / ___ \| | | (__| | | | |\ V /  __/
  \____|_|  \__,_|_| |_|\__,_|   /_/   \_\_|  \___|_| |_|_| \_/ \___|

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Services Running!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URLs:
  Frontend:   http://localhost:3000
  Backend:    http://localhost:8080/api
  Health:     http://localhost:8080/api/health

Logs:
  Backend:    tail -f logs/backend.log
  Frontend:   tail -f logs/frontend.log

Press Ctrl+C to stop all services
```

### Method 2: Start Services Separately

For more control, run each service in its own terminal:

**Terminal 1 - Backend:**
```bash
cd backend
./run-local.sh
```

You'll be prompted to choose build mode:
- **Debug** (option 1): Faster compilation, includes debug symbols
- **Release** (option 2): Optimized, but slower to compile

**Terminal 2 - Frontend:**
```bash
cd frontend
./run-local.sh
```

The frontend will automatically check if the backend is running.

### Method 3: Manual Start

If you prefer full control:

**Backend:**
```bash
cd backend
cargo run
# or for release mode:
cargo run --release
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Verification

After starting the services, verify everything is working:

```bash
./verify.sh
```

This comprehensive health check will verify:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   System Health Check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Backend Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend process... ✓ Running on port 8080
Health endpoint... ✓ Responding
API status... ✓ Healthy
Database connection... ✓ Connected
Meta endpoint... ✓ Responding
Decklists endpoint... ⚠ Not responding (may not have data yet)

Frontend Service
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend process... ✓ Running on port 3000
Frontend responding... ✓ Responding
Dashboard page... ✓ Accessible
Meta page... ✓ Accessible

Configuration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Backend .env... ✓ Exists
MongoDB URI configured... ✓ Configured
Frontend .env.local... ✓ Exists
API URL configured... ✓ http://localhost:8080/api

Summary
  Passed:   15
  Warnings: 1
  Failed:   0

   🎉 Everything looks great!
```

### Manual Verification

You can also test individual components:

**Backend Health:**
```bash
curl http://localhost:8080/api/health
# Expected: {"status":"healthy","database":"connected","timestamp":"..."}
```

**Backend API:**
```bash
curl http://localhost:8080/api/meta/format/Constructed
curl http://localhost:8080/api/decklists?limit=5
```

**Frontend:**
```bash
# Open in browser
open http://localhost:3000

# Or test with curl
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Problem:** Error message about port 8080 or 3000 already in use.

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or for port 3000
lsof -i :3000
kill -9 <PID>
```

The run scripts can also automatically kill processes for you when prompted.

#### 2. Backend Won't Compile

**Problem:** Rust compilation errors.

**Solution:**
```bash
# Update Rust to latest version
rustup update

# Clean build cache
cd backend
cargo clean
cargo build

# If still failing, check Rust version
rustc --version  # Should be 1.75.0 or higher
```

#### 3. MongoDB Connection Failed

**Problem:** Backend starts but can't connect to database.

**Symptoms:**
- Health check shows `database: "disconnected"`
- Errors in backend logs about connection

**Solution:**
```bash
# 1. Verify your MongoDB URI in backend/.env
cat backend/.env | grep MONGODB_URI

# 2. Test connection manually (if you have mongosh installed)
mongosh "your-mongodb-uri-here"

# 3. Common issues:
#    - Wrong username/password
#    - Need to URL-encode special characters in password
#    - Network firewall blocking connection
#    - MongoDB Atlas IP whitelist

# 4. Check MongoDB Atlas:
#    - Go to https://cloud.mongodb.com
#    - Network Access → Add your IP address (0.0.0.0/0 for development)
#    - Database Access → Verify user credentials
```

#### 4. Frontend Shows "Cannot Connect to Backend"

**Problem:** Frontend loads but shows connection errors.

**Solution:**
```bash
# 1. Verify backend is running
curl http://localhost:8080/api/health

# 2. Check frontend configuration
cat frontend/.env.local | grep NEXT_PUBLIC_API_URL

# 3. Ensure it points to correct URL:
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# 4. Restart frontend
cd frontend
./run-local.sh
```

#### 5. No Data Showing

**Problem:** Application runs but shows empty pages.

**Explanation:** The database is empty initially. Data is populated by:

1. **Automated Crawler** (runs daily at 02:00 UTC)
2. **Manual Data Import**

**Solution:**
```bash
# Wait for crawler to run, or manually trigger data population
# The backend logs will show crawler activity

# Check logs for crawler status
tail -f logs/backend.log | grep -i crawler
```

#### 6. npm Install Fails

**Problem:** Frontend dependency installation errors.

**Solution:**
```bash
cd frontend

# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install

# If still failing, check Node version
node --version  # Should be v20.x or higher
```

#### 7. "Command not found: cargo/npm"

**Problem:** Commands not found after installation.

**Solution:**
```bash
# For cargo (Rust):
source $HOME/.cargo/env

# Add to your shell profile (~/.zshrc or ~/.bash_profile):
echo 'source $HOME/.cargo/env' >> ~/.zshrc

# For npm: Verify Node.js installation
which node
# If not found, reinstall Node.js

# Restart terminal and try again
```

### Getting More Help

If you're still stuck:

1. **Check Logs:**
   ```bash
   # Backend logs
   tail -f logs/backend.log

   # Frontend logs
   tail -f logs/frontend.log
   ```

2. **Run Diagnostics:**
   ```bash
   ./scripts/check-prerequisites.sh
   ./verify.sh
   ```

3. **Review Documentation:**
   - `DEVELOPMENT.md` - Detailed development guide
   - `API.md` - API endpoint documentation
   - `ARCHITECTURE.md` - System architecture

4. **Contact:**
   - Open a GitHub issue
   - Check existing issues for similar problems
   - Contact project maintainer

## Next Steps

### Explore the Application

Once everything is running:

1. **Frontend** (http://localhost:3000)
   - Dashboard: Overview of meta statistics
   - Champions: Browse champion data
   - Decklists: View tournament decklists
   - Meta Analysis: Detailed meta breakdown

2. **Backend API** (http://localhost:8080/api)
   - `/health` - Health check
   - `/meta/format/{format}` - Meta statistics
   - `/decklists` - List decklists
   - `/champions` - List champions
   - `/events` - List events

### Development Workflow

**Making Changes:**

```bash
# Backend changes (Rust auto-recompiles on save with cargo run)
# No restart needed, but compilation takes a moment

# Frontend changes (Next.js hot reload)
# Changes appear instantly in browser
```

**Running Tests:**

```bash
# Backend tests
cd backend
cargo test

# Frontend tests (if implemented)
cd frontend
npm test
```

**Code Formatting:**

```bash
# Backend
cd backend
cargo fmt

# Frontend
cd frontend
npm run lint
```

### Adding Features

See `DEVELOPMENT.md` for:
- Code style guidelines
- Testing procedures
- Pull request process
- Architecture patterns

### Deployment

When ready to deploy:

1. Review `DEPLOYMENT.md` for production setup
2. Configure GitHub Actions for CI/CD
3. Set up AWS infrastructure with Terraform
4. Configure environment variables for production

## Quick Reference

### Scripts Summary

| Script | Purpose | Usage |
|--------|---------|-------|
| `./setup.sh` | Initial setup | Run once to configure everything |
| `./start-dev.sh` | Start both services | Run daily for development |
| `./verify.sh` | Health check | Verify system is working |
| `./scripts/check-prerequisites.sh` | Check dependencies | Verify prerequisites installed |
| `backend/run-local.sh` | Start backend only | Run backend separately |
| `frontend/run-local.sh` | Start frontend only | Run frontend separately |

### URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main application UI |
| Backend API | http://localhost:8080/api | REST API |
| Health Check | http://localhost:8080/api/health | API health status |

### File Locations

| File | Purpose |
|------|---------|
| `backend/.env` | Backend configuration (MongoDB, ports, etc.) |
| `frontend/.env.local` | Frontend configuration (API URL, site config) |
| `logs/backend.log` | Backend runtime logs |
| `logs/frontend.log` | Frontend runtime logs |

### Useful Commands

```bash
# Check if services are running
lsof -i :8080  # Backend
lsof -i :3000  # Frontend

# View logs
tail -f logs/backend.log
tail -f logs/frontend.log

# Stop services
# Press Ctrl+C if running in foreground
# Or kill by port:
kill -9 $(lsof -ti:8080)
kill -9 $(lsof -ti:3000)

# Rebuild everything
cd backend && cargo clean && cargo build
cd frontend && rm -rf .next && npm run build
```

## Tips for Success

1. **First build takes time**: Rust compilation can take 5-10 minutes on first run. Subsequent builds are much faster.

2. **Keep services running**: Once started, leave services running. Both support hot reload/auto-recompile.

3. **Use verify.sh often**: Run after changes to ensure everything still works.

4. **Monitor logs**: Keep log files open in a terminal to see real-time activity.

5. **MongoDB Atlas**: Add your IP to whitelist if connection fails.

6. **Data population**: Initial database is empty. Crawler runs daily, or wait for manual data import.

---

## Success!

You should now have a fully functional local development environment!

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│     ✓ Backend running on :8080                     │
│     ✓ Frontend running on :3000                    │
│     ✓ MongoDB connected                            │
│     ✓ All health checks passing                    │
│                                                     │
│     You're ready to develop!                       │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Happy Coding!** 🎉

---

*Need help? Open an issue or check DEVELOPMENT.md for more details.*
