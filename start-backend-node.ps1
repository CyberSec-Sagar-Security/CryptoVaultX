# PowerShell Script to Start Node.js Backend Server
Write-Host "🚀 CryptoVault - Node.js Backend Server" -ForegroundColor Blue
Write-Host "====================================" -ForegroundColor Blue

$nodePath = "D:\Study and work\College_Software_Projects\CryptoVault\backend-node"

Write-Host "📁 Node.js Backend Path: $nodePath" -ForegroundColor White
Write-Host "🌐 Node.js Backend API URL: http://localhost:3000" -ForegroundColor Green

if (-not (Test-Path $nodePath)) {
    Write-Host "❌ Node.js backend directory not found: $nodePath" -ForegroundColor Red
    exit 1
}

Set-Location $nodePath

Write-Host "📁 Location: $nodePath" -ForegroundColor Cyan

# Check if Node.js is available
try {
    node --version
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (Test-Path "package.json") {
    Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
}

# Run the Node.js server
Write-Host "🚀 Starting Node.js server..." -ForegroundColor Yellow
Write-Host "🌐 API will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Check if there's a start script in package.json
$packageJson = Get-Content -Path "package.json" | ConvertFrom-Json
if ($packageJson.scripts.start) {
    npm start
} else {
    # If no start script, try to run server.js directly
    node server.js
}

# Keep the window open if there's an error
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js server exited with code $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Press any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
