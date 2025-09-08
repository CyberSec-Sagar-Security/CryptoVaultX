# PowerShell Script to Start Backend Server
Write-Host "🚀 CryptoVault - Backend Server" -ForegroundColor Blue
Write-Host "===============================" -ForegroundColor Blue

$backendPath = "D:\Study and work\College_Software_Projects\CryptoVault\backend"

Write-Host "📁 Backend Path: $backendPath" -ForegroundColor White
Write-Host "🌐 Backend API URL: http://localhost:5000" -ForegroundColor Green

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

Set-Location $backendPath

Write-Host "📁 Location: $backendPath" -ForegroundColor Cyan
Write-Host "🐍 Starting Python Flask backend server..." -ForegroundColor Yellow

# Check if Python is available
try {
    python --version
    $pythonCommand = "python"
} catch {
    try {
        python3 --version
        $pythonCommand = "python3"
    } catch {
        Write-Host "❌ Python not found. Please install Python 3.x" -ForegroundColor Red
        exit 1
    }
}

# Check if requirements are installed
if (Test-Path "requirements.txt") {
    Write-Host "📦 Installing Python dependencies..." -ForegroundColor Yellow
    & $pythonCommand -m pip install -r requirements.txt
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Run the Flask application
Write-Host "🚀 Starting Flask server..." -ForegroundColor Yellow
Write-Host "🌐 API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Run the Flask application with appropriate environment variables
& $pythonCommand app.py

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Backend server exited with code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
