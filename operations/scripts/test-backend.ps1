# Test Flask Backend Script
Write-Host "🧪 Testing Flask Backend Setup" -ForegroundColor Magenta
Write-Host "==============================`n" -ForegroundColor Magenta

$backendPath = Join-Path (Split-Path $PSScriptRoot -Parent) "backend"
Set-Location $backendPath

Write-Host "📂 Backend Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔍 Checking Flask setup...`n" -ForegroundColor Cyan

# Check Python
Write-Host "🐍 Python Version:" -ForegroundColor Yellow
try {
    python --version
    Write-Host "✅ Python found" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found or not in PATH" -ForegroundColor Red
}

Write-Host ""

# Check Flask files
$requiredFiles = @("app.py", "requirements.txt", "config.py", "models.py")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

Write-Host ""

# Check requirements
if (Test-Path "requirements.txt") {
    Write-Host "📋 Requirements.txt contents:" -ForegroundColor Cyan
    Get-Content "requirements.txt" | ForEach-Object { Write-Host "   - $_" -ForegroundColor White }
}

Write-Host ""

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "🔧 Virtual environment found at: $(Join-Path (Get-Location) 'venv')" -ForegroundColor Green
} else {
    Write-Host "⚠️ No virtual environment found" -ForegroundColor Yellow
    Write-Host "💡 To create one: python -m venv venv" -ForegroundColor Cyan
}

Write-Host "`n🔍 Database connection test..." -ForegroundColor Cyan
try {
    python -c "from database import db_manager; print('✅ Database connection successful')"
} catch {
    Write-Host "❌ Database connection failed" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")