# Start React Frontend Application  
Write-Host "⚛️ CryptoVault - React Frontend (Frontend_New)" -ForegroundColor Blue
Write-Host "=============================================" -ForegroundColor Blue

$frontendPath = "d:\Study and work\College_Software_Projects\CryptoVault\Frontend_New"

Write-Host "📁 Frontend Path: $frontendPath" -ForegroundColor White
Write-Host "🌐 Frontend URL: http://localhost:5173" -ForegroundColor Green
Write-Host "📡 Backend API: http://localhost:5000/api" -ForegroundColor Cyan

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath

Write-Host "📁 Location: $frontendPath" -ForegroundColor Cyan
Write-Host "🔧 Installing dependencies..." -ForegroundColor Yellow

try {
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Dependency installation failed, continuing..." -ForegroundColor Yellow
}

Write-Host "🚀 Starting frontend development server..." -ForegroundColor Yellow
Write-Host "🌐 UI will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔄 Hot reload enabled - changes will auto-refresh" -ForegroundColor Green
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

npm run dev
