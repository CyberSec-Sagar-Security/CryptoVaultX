# Test React Frontend Script
Write-Host "🧪 Testing React Frontend Setup" -ForegroundColor Magenta
Write-Host "==============================`n" -ForegroundColor Magenta

$frontendPath = Join-Path (Split-Path $PSScriptRoot -Parent) "Frontend_New"
Set-Location $frontendPath

Write-Host "📂 Frontend Directory: $(Get-Location)" -ForegroundColor White
Write-Host "🔍 Checking React setup...`n" -ForegroundColor Cyan

# Check Node.js
Write-Host "🟩 Node.js Version:" -ForegroundColor Yellow
try {
    node --version
    Write-Host "✅ Node.js found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
}

Write-Host ""

# Check npm
Write-Host "📦 npm Version:" -ForegroundColor Yellow
try {
    npm --version
    Write-Host "✅ npm found" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
}

Write-Host ""

# Check React files
$requiredFiles = @("package.json", "vite.config.ts", "src/main.tsx", "src/App.tsx")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file found" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

Write-Host ""

# Check node_modules
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules directory exists" -ForegroundColor Green
    $packageCount = (Get-ChildItem "node_modules" -Directory).Count
    Write-Host "📦 Installed packages: $packageCount" -ForegroundColor White
} else {
    Write-Host "❌ node_modules missing - run 'npm install'" -ForegroundColor Red
}

Write-Host ""

# Check package.json scripts
if (Test-Path "package.json") {
    Write-Host "📋 Available npm scripts:" -ForegroundColor Cyan
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.scripts) {
        $packageJson.scripts.PSObject.Properties | ForEach-Object {
            Write-Host "   - npm run $($_.Name)" -ForegroundColor White
        }
    }
}

Write-Host ""

# Test TypeScript compilation
Write-Host "🔍 Testing TypeScript compilation..." -ForegroundColor Cyan
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TypeScript compilation successful" -ForegroundColor Green
    } else {
        Write-Host "❌ TypeScript compilation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not test TypeScript compilation" -ForegroundColor Red
}

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")