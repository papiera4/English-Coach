#!/bin/bash

# English Coach - macOS Startup Script
# This script starts both backend and frontend servers on macOS

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/src/backend"
FRONTEND_DIR="$PROJECT_DIR/src/frontend"

echo "================================================"
echo "English Coach - Starting Application (macOS)"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Checking Node.js version..."
node --version
echo ""

# Check for .env file in project root
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "WARNING: .env file not found in project root"
    echo "Creating .env from .env.example..."
    cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    echo "Please edit $PROJECT_DIR/.env with your LLM credentials"
    echo ""
fi

# Install backend dependencies if needed
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$BACKEND_DIR"
    npm install
    cd "$PROJECT_DIR"
    echo ""
fi

# Install frontend dependencies if needed
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
    cd "$PROJECT_DIR"
    echo ""
fi

echo "Starting backend server on port 3001..."
cd "$BACKEND_DIR"
npm run dev &
BACKEND_PID=$!

echo "Starting frontend server on port 3000..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================================"
echo "Application Started Successfully"
echo "================================================"
echo "Backend:  http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "================================================"
echo ""

# Handle termination
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
