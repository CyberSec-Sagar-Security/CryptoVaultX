# 🚀 Run All CryptoVaultX Tests
# PowerShell script to run comprehensive tests

Write-Host "🎓 CryptoVaultX Professor Demo - Test Runner" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if browser is available
$browsers = @("chrome", "msedge", "firefox")
$selectedBrowser = $null

foreach ($browser in $browsers) {
    try {
        $path = Get-Command $browser -ErrorAction SilentlyContinue
        if ($path) {
            $selectedBrowser = $browser
            break
        }
    } catch {
        # Continue to next browser
    }
}

if (-not $selectedBrowser) {
    Write-Host "⚠️  No suitable browser found. Please open demo-script.html manually." -ForegroundColor Yellow
    Write-Host "📍 File location: $PWD\demo-script.html" -ForegroundColor Green
    pause
    exit
}

Write-Host "🌐 Using browser: $selectedBrowser" -ForegroundColor Green

# Get the full path to the demo script
$demoPath = Join-Path $PWD "demo-script.html"

Write-Host "📂 Opening demo script..." -ForegroundColor Yellow
Write-Host "📍 Path: $demoPath" -ForegroundColor Gray

# Open the demo in browser
try {
    if ($selectedBrowser -eq "chrome") {
        Start-Process "chrome" -ArgumentList $demoPath
    } elseif ($selectedBrowser -eq "msedge") {
        Start-Process "msedge" -ArgumentList $demoPath
    } elseif ($selectedBrowser -eq "firefox") {
        Start-Process "firefox" -ArgumentList $demoPath
    }
    
    Write-Host "✅ Demo opened successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Instructions for Professor Demo:" -ForegroundColor Cyan
    Write-Host "1. Click 'Run All Tests' to start the demonstration" -ForegroundColor White
    Write-Host "2. Watch each test module execute:" -ForegroundColor White
    Write-Host "   • Key Management Module" -ForegroundColor Gray
    Write-Host "   • Encryption/Decryption Module" -ForegroundColor Gray
    Write-Host "   • File Upload with Encryption" -ForegroundColor Gray
    Write-Host "   • End-to-End Integration" -ForegroundColor Gray
    Write-Host "3. Review the detailed logs and results" -ForegroundColor White
    Write-Host "4. Check the summary statistics" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Features Demonstrated:" -ForegroundColor Yellow
    Write-Host "✓ Client-side AES-256-GCM encryption" -ForegroundColor Green
    Write-Host "✓ Secure key generation and management" -ForegroundColor Green
    Write-Host "✓ File encryption before upload" -ForegroundColor Green
    Write-Host "✓ Data integrity verification" -ForegroundColor Green
    Write-Host "✓ Session-based key storage" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error opening browser: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "📍 Please manually open: $demoPath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Additional Test Files:" -ForegroundColor Cyan
Write-Host "• encryption-test.html - Detailed encryption testing" -ForegroundColor Gray
Write-Host "• key-management-test.html - Key management testing" -ForegroundColor Gray
Write-Host "• upload-integration-test.html - Upload workflow testing" -ForegroundColor Gray

Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "• README.md - Complete test documentation" -ForegroundColor Gray
Write-Host "• test-files/ - Sample files for testing" -ForegroundColor Gray

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")