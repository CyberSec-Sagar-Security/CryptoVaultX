# PowerShell Script to Start Services and Run Tests
Write-Host "🧪 CryptoVault - Test Environment" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta

$scriptPath = $PSScriptRoot

Write-Host "📁 Script Path: $scriptPath" -ForegroundColor White
Write-Host "🔧 Starting services for testing..." -ForegroundColor Cyan

# Start the Flask backend
Write-Host "🐍 Starting Flask backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-backend.ps1`""

# Start the Node.js backend
Write-Host "🟩 Starting Node.js backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-backend-node.ps1`""

# Wait for backends to initialize
Write-Host "⏱️ Waiting for backends to initialize (15 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Run connection test
Write-Host "🔌 Testing backend connections..." -ForegroundColor Yellow

# Create a simple connection test script
$testScript = @"
# Test Connection Script
Write-Host "🧪 Testing connections to backends..." -ForegroundColor Cyan

# Test Flask backend
try {
    \$flaskResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 5
    if (\$flaskResponse.StatusCode -eq 200) {
        Write-Host "✅ Flask backend is running: \$(\$flaskResponse.Content)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Flask backend returned status code \$(\$flaskResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Flask backend is not responding: \$(\$_.Exception.Message)" -ForegroundColor Red
}

# Test Node.js backend
try {
    \$nodeResponse = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
    if (\$nodeResponse.StatusCode -eq 200) {
        Write-Host "✅ Node.js backend is running: \$(\$nodeResponse.Content)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Node.js backend returned status code \$(\$nodeResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js backend is not responding: \$(\$_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Press any key to continue starting the frontend..."
\$null = \$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
"@

$testConnectionPath = "$scriptPath\test-connection.ps1"
$testScript | Out-File -FilePath $testConnectionPath -Encoding utf8

# Run the test connection script
Start-Process powershell -ArgumentList "-NoExit -File `"$testConnectionPath`""

# Start the frontend after tests complete
Write-Host "⚛️ Starting React frontend..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit -File `"$scriptPath\start-frontend.ps1`""

Write-Host "✅ Test environment setup complete" -ForegroundColor Magenta
Write-Host "📝 Service URLs:" -ForegroundColor White
Write-Host "   🐍 Flask API: http://localhost:5000" -ForegroundColor Yellow
Write-Host "   🟩 Node.js API: http://localhost:3000" -ForegroundColor Green
Write-Host "   ⚛️ Frontend: http://localhost:5173" -ForegroundColor Blue

# Keep this window open
Write-Host ""
Write-Host "📌 This window can be closed. Each service is running in its own window." -ForegroundColor Cyan
Write-Host "⚠️ To stop all services, close each individual window." -ForegroundColor Red
