# PowerShell Script to Start Node.js Backend
Write-Host "🟩 Starting Node.js Backend (CryptoVault)" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$backendNodePath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "archive\backend-node"
Set-Location $backendNodePath

Write-Host "📂 Current Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔍 Checking for Node.js app..." -ForegroundColor Cyan

if (Test-Path "server.js") {
    Write-Host "✅ Node.js app found!" -ForegroundColor Green
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Cyan
        npm install
    } else {
        Write-Host "✅ Node modules already installed" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 Starting Node.js server on http://localhost:3000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
    
    # Start Node.js app
    node server.js
} else {
    Write-Host "❌ Node.js app (server.js) not found!" -ForegroundColor Red
    Write-Host "📂 Current directory contents:" -ForegroundColor White
    Get-ChildItem | Format-Table Name, Length, LastWriteTime
}

Write-Host "`n⏹️ Node.js backend stopped." -ForegroundColor Red
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")