# CryptoVaultX Complete Development Environment Launcher
# This script opens separate PowerShell windows for backend and frontend servers

Write-Host "🚀 CryptoVaultX Development Environment Launcher" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$projectRoot = "d:\Study and work\College_Software_Projects\CryptoVault"

# Verify project structure
Write-Host "📂 Verifying project structure..." -ForegroundColor Yellow

$backendScript = Join-Path $projectRoot "start_backend.ps1"
$frontendScript = Join-Path $projectRoot "start_frontend.ps1"

if (!(Test-Path $backendScript)) {
    Write-Host "❌ Backend startup script not found: $backendScript" -ForegroundColor Red
    exit 1
}

if (!(Test-Path $frontendScript)) {
    Write-Host "❌ Frontend startup script not found: $frontendScript" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Startup scripts found" -ForegroundColor Green

# Launch backend in new PowerShell window
Write-Host "`n🔧 Launching Backend Server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$backendScript" -WindowStyle Normal
    Write-Host "✅ Backend server window opened" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to launch backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Wait a moment before launching frontend
Start-Sleep -Seconds 2

# Launch frontend in new PowerShell window
Write-Host "🎨 Launching Frontend Server..." -ForegroundColor Yellow
try {
    Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$frontendScript" -WindowStyle Normal
    Write-Host "✅ Frontend server window opened" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to launch frontend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 CryptoVaultX Development Environment Started!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "📍 Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "📍 Frontend UI: http://localhost:5173" -ForegroundColor White
Write-Host "`n📝 Tips:" -ForegroundColor Cyan
Write-Host "• Two separate PowerShell windows have been opened" -ForegroundColor White
Write-Host "• Backend window runs the Flask API server" -ForegroundColor White
Write-Host "• Frontend window runs the Vite development server" -ForegroundColor White
Write-Host "• Keep both windows open while developing" -ForegroundColor White
Write-Host "• Press Ctrl+C in each window to stop the servers" -ForegroundColor White
Write-Host "`n🔒 Local Storage Features:" -ForegroundColor Yellow
Write-Host "• Per-user encrypted file storage" -ForegroundColor White
Write-Host "• 512MB quota per user" -ForegroundColor White
Write-Host "• Client-side AES-256-GCM encryption" -ForegroundColor White
Write-Host "• Automatic folder creation on registration" -ForegroundColor White

Write-Host "`nPress any key to close this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")