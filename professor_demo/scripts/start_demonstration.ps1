# CryptoVaultX Professor Demonstration Script
# This script automates the demonstration setup

Write-Host "🎓 CryptoVaultX Professor Demonstration Setup" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Function to start server in new window
function Start-ServerWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "🚀 Starting $Title..." -ForegroundColor Yellow
    
    $ps = New-Object System.Diagnostics.ProcessStartInfo
    $ps.FileName = "powershell.exe"
    $ps.Arguments = "-NoExit -Command `"cd '$WorkingDirectory'; $Command`""
    $ps.WindowStyle = "Normal"
    $ps.CreateNoWindow = $false
    
    [System.Diagnostics.Process]::Start($ps) | Out-Null
    Write-Host "✅ $Title started in new window" -ForegroundColor Green
}

try {
    # Check if we're in the correct directory
    $currentDir = Get-Location
    if (-not (Test-Path "core\backend\app.py")) {
        Write-Host "❌ Error: Please run this script from the CryptoVault project root directory" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "📍 Current directory: $currentDir" -ForegroundColor Cyan
    
    # Start Backend Server (Window A)
    Write-Host "`n🏃‍♂️ Step 1: Starting Backend Server" -ForegroundColor Magenta
    $backendPath = Join-Path $currentDir "core\backend"
    Start-ServerWindow -Title "Backend Server" -Command "python app.py" -WorkingDirectory $backendPath
    
    # Wait a moment
    Start-Sleep -Seconds 3
    
    # Start Frontend Server (Window B)
    Write-Host "`n🏃‍♂️ Step 2: Starting Frontend Server" -ForegroundColor Magenta
    $frontendPath = Join-Path $currentDir "core\frontend"
    Start-ServerWindow -Title "Frontend Server" -Command "npm run dev" -WorkingDirectory $frontendPath
    
    # Wait for servers to start
    Write-Host "`n⏳ Waiting for servers to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Test server connectivity
    Write-Host "`n🔍 Testing server connectivity..." -ForegroundColor Cyan
    
    try {
        $backendTest = Invoke-WebRequest -Uri "http://127.0.0.1:5000/api/health" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ Backend server responding (Status: $($backendTest.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Backend server may still be starting..." -ForegroundColor Yellow
    }
    
    try {
        $frontendTest = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ Frontend server responding (Status: $($frontendTest.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Frontend server may still be starting..." -ForegroundColor Yellow
    }
    
    # Show demonstration instructions
    Write-Host "`n📋 DEMONSTRATION INSTRUCTIONS:" -ForegroundColor Green
    Write-Host "=============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "1. 🌐 Open browser and navigate to: http://localhost:5173/" -ForegroundColor White
    Write-Host "2. 👤 Create account or login" -ForegroundColor White
    Write-Host "3. 📁 Navigate to Files page" -ForegroundColor White
    Write-Host "4. 🔧 Open browser console (F12)" -ForegroundColor White
    Write-Host "5. 📊 Run verification script:" -ForegroundColor White
    Write-Host "   Copy and paste content from: professor_demo\scripts\complete_verification.js" -ForegroundColor Cyan
    Write-Host "   Then run: runCompleteVerification()" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📂 Test Files Available:" -ForegroundColor Green
    Write-Host "- professor_demo\test_files\sample_document.txt" -ForegroundColor Cyan
    Write-Host "- professor_demo\test_files\test_config.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📜 Verification Scripts:" -ForegroundColor Green
    Write-Host "- professor_demo\scripts\complete_verification.js" -ForegroundColor Cyan
    Write-Host "- professor_demo\scripts\storage_analysis.js" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📖 Full Documentation:" -ForegroundColor Green
    Write-Host "- professor_demo\README.md" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "🎯 EXPECTED DEMONSTRATION FLOW:" -ForegroundColor Magenta
    Write-Host "1. Upload test file → Verify client-side encryption" -ForegroundColor White
    Write-Host "2. Check storage → Verify encrypted data storage" -ForegroundColor White
    Write-Host "3. Download file → Verify client-side decryption" -ForegroundColor White
    Write-Host "4. Compare content → Verify data integrity" -ForegroundColor White
    Write-Host "5. Generate report → Document verification results" -ForegroundColor White
    Write-Host ""
    
    Write-Host "✨ Demonstration environment ready!" -ForegroundColor Green
    Write-Host "🎓 Good luck with your professor demonstration!" -ForegroundColor Yellow
    
} catch {
    Write-Host "❌ Error during setup: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Keep window open
Write-Host "`nPress any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")