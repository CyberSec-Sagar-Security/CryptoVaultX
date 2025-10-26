# CryptoVaultX Backend Server Startup Script
# This script starts the Flask backend server for CryptoVaultX

Write-Host "🚀 Starting CryptoVaultX Backend Server" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Change to backend directory
$backendPath = "d:\Study and work\College_Software_Projects\CryptoVault\core\backend"
Write-Host "📂 Changing to backend directory: $backendPath" -ForegroundColor Yellow

try {
    Set-Location $backendPath
    Write-Host "✅ Directory changed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to change directory: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if Python is available
Write-Host "🐍 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+ and add it to PATH" -ForegroundColor Red
    exit 1
}

# Check if required files exist
$requiredFiles = @("app.py", "requirements.txt", "models.py")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Start the Flask backend server
Write-Host "`n🔥 Starting Flask Backend Server..." -ForegroundColor Cyan
Write-Host "📍 Backend will be available at: http://localhost:5000" -ForegroundColor White
Write-Host "📍 API endpoints available at: http://localhost:5000/api" -ForegroundColor White
Write-Host "`n⚠️  Keep this terminal open while using CryptoVaultX" -ForegroundColor Yellow
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "`n" -ForegroundColor White

# Run the Flask app
python app.py