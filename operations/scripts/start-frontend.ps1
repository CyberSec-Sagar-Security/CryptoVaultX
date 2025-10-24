# PowerShell Script to Start React Frontend
Write-Host "⚛️ Starting React Frontend (CryptoVault)" -ForegroundColor Blue
Write-Host "======================================`n" -ForegroundColor Blue

$frontendPath = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) "core\frontend"
Set-Location $frontendPath

Write-Host "📂 Current Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔍 Checking for React app..." -ForegroundColor Cyan

if (Test-Path "package.json") {
    Write-Host "✅ React app found!" -ForegroundColor Green
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Installing React dependencies..." -ForegroundColor Cyan
        npm install
    } else {
        Write-Host "✅ Node modules already installed" -ForegroundColor Green
    }
    
    Write-Host "`n🚀 Starting React development server on http://localhost:5173" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop the server`n" -ForegroundColor Yellow
    
    # Start React app
    npm run dev
} else {
    Write-Host "❌ React app (package.json) not found!" -ForegroundColor Red
    Write-Host "📂 Current directory contents:" -ForegroundColor White
    Get-ChildItem | Format-Table Name, Length, LastWriteTime
}

Write-Host "`n⏹️ React frontend stopped." -ForegroundColor Red
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")