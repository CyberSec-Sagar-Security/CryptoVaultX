# PowerShell Script to Start Flask Backend
Write-Host "🐍 Starting Flask Backend (CryptoVault)" -ForegroundColor Yellow
Write-Host "=====================================`n" -ForegroundColor Yellow

$backendPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "core\backend"
Set-Location $backendPath

Write-Host "📂 Current Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔍 Checking for Flask app..." -ForegroundColor Cyan

if (Test-Path "app.py") {
    Write-Host "✅ Flask app found!" -ForegroundColor Green
    
    # Check if virtual environment exists
    if (Test-Path "venv") {
        Write-Host "🔧 Activating virtual environment..." -ForegroundColor Cyan
        & "venv\Scripts\Activate.ps1"
    } else {
        Write-Host "⚠️ No virtual environment found, using system Python" -ForegroundColor Yellow
    }
    
    # Install requirements if needed
    if (Test-Path "requirements.txt") {
        Write-Host "📦 Installing/updating requirements..." -ForegroundColor Cyan
        pip install -r requirements.txt
    }
    
    Write-Host "`n🚀 Starting Flask server on http://localhost:5000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
    
    # Set environment variables
    $env:FLASK_ENV = "development"
    $env:FLASK_DEBUG = "1"
    
    # Start Flask app
    python app.py
} else {
    Write-Host "❌ Flask app (app.py) not found!" -ForegroundColor Red
    Write-Host "📂 Current directory contents:" -ForegroundColor White
    Get-ChildItem | Format-Table Name, Length, LastWriteTime
}

Write-Host "`n⏹️ Flask backend stopped." -ForegroundColor Red
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")