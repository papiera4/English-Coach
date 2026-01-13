@echo off
REM English Coach - Windows Startup Script
REM This script starts both backend and frontend servers on Windows

setlocal enabledelayedexpansion

for %%I in (.) do set "PROJECT_DIR=%%~fI\.."

set "BACKEND_DIR=%PROJECT_DIR%\src\backend"
set "FRONTEND_DIR=%PROJECT_DIR%\src\frontend"

echo.
echo ================================================
echo English Coach - Starting Application (Windows)
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking Node.js version...
node --version
echo.

REM Check for .env file in project root
if not exist "%PROJECT_DIR%\.env" (
    echo WARNING: .env file not found in project root
    echo Creating .env from .env.example...
    copy "%PROJECT_DIR%\.env.example" "%PROJECT_DIR%\.env"
    echo Please edit %PROJECT_DIR%\.env with your LLM credentials
    echo.
)

REM Install backend dependencies if needed
if not exist "%BACKEND_DIR%\node_modules" (
    echo Installing backend dependencies...
    cd /d "%BACKEND_DIR%"
    call npm install
    cd /d "%PROJECT_DIR%"
    echo.
)

REM Install frontend dependencies if needed
if not exist "%FRONTEND_DIR%\node_modules" (
    echo Installing frontend dependencies...
    cd /d "%FRONTEND_DIR%"
    call npm install
    cd /d "%PROJECT_DIR%"
    echo.
)

echo Starting backend server on port 3001...
cd /d "%BACKEND_DIR%"
start cmd /k "npm run dev"
timeout /t 3 /nobreak

echo Starting frontend server on port 3000...
cd /d "%FRONTEND_DIR%"
start cmd /k "npm run dev"

echo.
echo ================================================
echo Application Started Successfully
echo ================================================
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Both servers are running in separate windows.
echo Close the windows to stop the servers.
echo ================================================
echo.

pause
