# English Coach - Backend Startup Script

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$BackendDir = Join-Path $ProjectDir "src\backend"

$host.UI.RawUI.WindowTitle = "English Coach - Backend"
Write-Host "Starting Backend..." -ForegroundColor Cyan

# Check for .env file in project root
$EnvPath = Join-Path $ProjectDir ".env"
$EnvExamplePath = Join-Path $ProjectDir ".env.example"

if (-not (Test-Path $EnvPath)) {
    Write-Host "WARNING: .env file not found in project root" -ForegroundColor Yellow
    Write-Host "Creating .env from .env.example..."
    if (Test-Path $EnvExamplePath) {
        Copy-Item $EnvExamplePath $EnvPath
        Write-Host "Please edit $EnvPath with your LLM credentials" -ForegroundColor Magenta
    }
}

# Install backend dependencies if needed
$BackendModulesPath = Join-Path $BackendDir "node_modules"
if (-not (Test-Path $BackendModulesPath)) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
    Push-Location $BackendDir
    npm install
    Pop-Location
}

# Start Backend
Push-Location $BackendDir
npm run dev