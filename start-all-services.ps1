# PowerShell Script to Start All Services in Separate Windows
Write-Host "🚀 CryptoVault - Starting All Services" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta

$scriptPath = $PSScriptRoot

Write-Host "📁 Script Path: $scriptPath" -ForegroundColor White
Write-Host "🔧 Starting services in separate windows..." -ForegroundColor Cyan

# Start the Flask backend
Write-Host "🐍 Starting Flask backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-backend.ps1`""

# Start the Node.js backend
Write-Host "🟩 Starting Node.js backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-backend-node.ps1`""

# Wait a moment to let backends initialize
Start-Sleep -Seconds 3

# Start the frontend
Write-Host "⚛️ Starting React frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-frontend.ps1`""

Write-Host "✅ All services started in separate windows" -ForegroundColor Magenta
Write-Host "📝 Service URLs:" -ForegroundColor White
Write-Host "   🐍 Flask API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "   🟩 Node.js API: http://localhost:3000" -ForegroundColor Green
Write-Host "   ⚛️ Frontend: http://localhost:5173" -ForegroundColor Blue

# Keep this window open
Write-Host ""
Write-Host "📌 This window can be closed. Each service is running in its own window." -ForegroundColor Cyan
Write-Host "⚠️ To stop all services, close each individual window." -ForegroundColor Red
