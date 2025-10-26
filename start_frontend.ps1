# CryptoVaultX Frontend Development Server Startup Script
# This script starts the Vite development server for CryptoVaultX frontend

Write-Host "🚀 Starting CryptoVaultX Frontend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Change to frontend directory
$frontendPath = "d:\Study and work\College_Software_Projects\CryptoVault\core\frontend"
Write-Host "📂 Changing to frontend directory: $frontendPath" -ForegroundColor Yellow

try {
    Set-Location $frontendPath
    Write-Host "✅ Directory changed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to change directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
Write-Host "🟢 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 16+ and add it to PATH" -ForegroundColor Red
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version 2>&1
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please ensure npm is installed with Node.js" -ForegroundColor Red
    exit 1
}

# Check if required files exist
$requiredFiles = @("package.json", "vite.config.ts", "src\main.tsx")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

# Start the Vite development server
Write-Host "`n🔥 Starting Vite Development Server..." -ForegroundColor Cyan
Write-Host "📍 Frontend will be available at: http://localhost:5173" -ForegroundColor White
Write-Host "📍 Hot reload enabled for development" -ForegroundColor White
Write-Host "`n⚠️  Keep this terminal open while developing CryptoVaultX" -ForegroundColor Yellow
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "`n" -ForegroundColor White

# Run the Vite dev server
npm run dev