# Quick Verification Script for Encrypted Upload Implementation
# Run this to verify all components are properly configured

Write-Host "=== CryptoVaultX Encrypted Upload Verification ===" -ForegroundColor Cyan

# Check frontend files
Write-Host "`n1. Checking Frontend Files..." -ForegroundColor Yellow
$frontendPath = "D:\Study and work\College_Software_Projects\CryptoVault\Frontend_New"

if (Test-Path "$frontendPath\src\lib\crypto.ts") {
    Write-Host "✅ crypto.ts library exists" -ForegroundColor Green
} else {
    Write-Host "❌ crypto.ts library missing" -ForegroundColor Red
}

if (Test-Path "$frontendPath\src\pages\dashboard\Upload.tsx") {
    Write-Host "✅ Upload.tsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ Upload.tsx missing" -ForegroundColor Red
}

if (Test-Path "$frontendPath\src\pages\dashboard\FilesPage.tsx") {
    Write-Host "✅ FilesPage.tsx exists" -ForegroundColor Green
} else {
    Write-Host "❌ FilesPage.tsx missing" -ForegroundColor Red
}

# Check backend files
Write-Host "`n2. Checking Backend Files..." -ForegroundColor Yellow
$backendPath = "D:\Study and work\College_Software_Projects\CryptoVault\backend"

if (Test-Path "$backendPath\routes\files.py") {
    Write-Host "✅ files.py route exists" -ForegroundColor Green
} else {
    Write-Host "❌ files.py route missing" -ForegroundColor Red
}

if (Test-Path "$backendPath\middleware\auth.py") {
    Write-Host "✅ auth.py middleware exists" -ForegroundColor Green
} else {
    Write-Host "❌ auth.py middleware missing" -ForegroundColor Red
}

# Check for required directories
Write-Host "`n3. Checking Directory Structure..." -ForegroundColor Yellow

if (Test-Path "$backendPath\uploads") {
    Write-Host "✅ uploads directory exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ uploads directory missing - will be created automatically" -ForegroundColor Yellow
}

# Check for package.json and requirements.txt
Write-Host "`n4. Checking Dependencies..." -ForegroundColor Yellow

if (Test-Path "$frontendPath\package.json") {
    Write-Host "✅ Frontend package.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend package.json missing" -ForegroundColor Red
}

if (Test-Path "$backendPath\requirements.txt") {
    Write-Host "✅ Backend requirements.txt exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend requirements.txt missing" -ForegroundColor Red
}

# Check key implementation details
Write-Host "`n5. Checking Implementation Details..." -ForegroundColor Yellow

# Check crypto.ts for key functions
$cryptoContent = Get-Content "$frontendPath\src\lib\crypto.ts" -Raw -ErrorAction SilentlyContinue
if ($cryptoContent -and $cryptoContent.Contains("encryptFileForUpload") -and $cryptoContent.Contains("AES-GCM")) {
    Write-Host "✅ Crypto library has required functions" -ForegroundColor Green
} else {
    Write-Host "❌ Crypto library missing required functions" -ForegroundColor Red
}

# Check Upload.tsx for encryption usage
$uploadContent = Get-Content "$frontendPath\src\pages\dashboard\Upload.tsx" -Raw -ErrorAction SilentlyContinue
if ($uploadContent -and $uploadContent.Contains("encryptFileForUpload") -and $uploadContent.Contains("/api/files")) {
    Write-Host "✅ Upload page uses encryption and correct endpoint" -ForegroundColor Green
} else {
    Write-Host "❌ Upload page missing encryption or wrong endpoint" -ForegroundColor Red
}

# Check backend for authentication
$filesContent = Get-Content "$backendPath\routes\files.py" -Raw -ErrorAction SilentlyContinue
if ($filesContent -and $filesContent.Contains("@auth_required") -and $filesContent.Contains("multipart/form-data")) {
    Write-Host "✅ Backend has authentication and accepts multipart data" -ForegroundColor Green
} else {
    Write-Host "❌ Backend missing authentication or multipart support" -ForegroundColor Red
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Open 3 separate PowerShell windows" -ForegroundColor White
Write-Host "2. Window A: Start backend (cd backend; python app.py)" -ForegroundColor White
Write-Host "3. Window B: Start frontend (cd Frontend_New; npm run dev)" -ForegroundColor White
Write-Host "4. Window C: Start database if needed (docker-compose up -d)" -ForegroundColor White
Write-Host "5. Navigate to http://localhost:5173 and test upload" -ForegroundColor White
Write-Host "`nSee ENCRYPTED_UPLOAD_TEST_PLAN.md for detailed testing instructions." -ForegroundColor Cyan