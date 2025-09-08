# Test Connection Script
Write-Host "🧪 Testing connections to backends..." -ForegroundColor Cyan

# Test Flask backend
try {
    \ = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5
    if (\.StatusCode -eq 200) {
        Write-Host "✅ Flask backend is running: \" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Flask backend returned status code \" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Flask backend is not responding: \" -ForegroundColor Red
}

# Test Node.js backend
try {
    \ = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
    if (\.StatusCode -eq 200) {
        Write-Host "✅ Node.js backend is running: \" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Node.js backend returned status code \" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js backend is not responding: \" -ForegroundColor Red
}

Write-Host "Press any key to continue starting the frontend..."
\ = \System.Management.Automation.Internal.Host.InternalHost.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
