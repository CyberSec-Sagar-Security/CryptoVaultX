# Restart Both Servers with CORS Fixes
Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 RESTARTING CRYPTOVAULT SERVERS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

# Kill existing processes on ports 5000 and 5174
Write-Host "🛑 Stopping existing servers..." -ForegroundColor Yellow

# Kill backend (port 5000)
$backendProcess = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($backendProcess) {
    Stop-Process -Id $backendProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Stopped backend on port 5000" -ForegroundColor Green
}

# Kill frontend (port 5174)
$frontendProcess = Get-NetTCPConnection -LocalPort 5174 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($frontendProcess) {
    Stop-Process -Id $frontendProcess -Force -ErrorAction SilentlyContinue
    Write-Host "   ✓ Stopped frontend on port 5174" -ForegroundColor Green
}

Start-Sleep -Seconds 2

Write-Host "`n🚀 Starting servers with enhanced CORS..." -ForegroundColor Cyan

# Start Backend
Write-Host "`n📡 Starting Backend (Flask)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Study and work\College_Software_Projects\CryptoVault\core\backend'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan; python app.py"

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "🎨 Starting Frontend (Vite)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\Study and work\College_Software_Projects\CryptoVault\core\frontend'; Write-Host '🎨 Frontend Server Starting...' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 3

Write-Host "`n✅ Servers started successfully!" -ForegroundColor Green
Write-Host "`n📍 URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "   Test Page: http://localhost:5174/test.html" -ForegroundColor White

Write-Host "`n🧪 Testing backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend is responding!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "   1. Open: http://localhost:5174/test.html" -ForegroundColor White
Write-Host "   2. Click 'Run All Connectivity Tests'" -ForegroundColor White
Write-Host "   3. All tests should pass ✅" -ForegroundColor Green
Write-Host "`n   If tests fail, press F12 and check:" -ForegroundColor Yellow
Write-Host "   - Console tab for JavaScript errors" -ForegroundColor Gray
Write-Host "   - Network tab for failed requests" -ForegroundColor Gray
Write-Host "   - Response headers for CORS" -ForegroundColor Gray

Write-Host "`n═══════════════════════════════════════════════`n" -ForegroundColor Cyan
