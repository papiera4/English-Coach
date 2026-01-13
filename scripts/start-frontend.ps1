# English Coach - Frontend Startup Script

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$FrontendDir = Join-Path $ProjectDir "src\frontend"

$host.UI.RawUI.WindowTitle = "English Coach - Frontend"
Write-Host "Starting Frontend..." -ForegroundColor Cyan

# Install frontend dependencies if needed
$FrontendModulesPath = Join-Path $FrontendDir "node_modules"
if (-not (Test-Path $FrontendModulesPath)) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
    Push-Location $FrontendDir
    npm install
    Pop-Location
}

# Start Frontend
Push-Location $FrontendDir
npm run dev