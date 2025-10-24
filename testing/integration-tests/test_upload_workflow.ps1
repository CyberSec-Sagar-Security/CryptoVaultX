# Test Upload Workflow - Complete End-to-End Testing
# This script tests the complete encrypted file upload workflow

Write-Host "=== CryptoVault Upload Workflow Test ===" -ForegroundColor Green
Write-Host "Testing complete encrypted file upload functionality" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:5000"
$headers = @{ "Content-Type" = "application/json" }
$testEmail = "workflow_test@example.com"
$testUsername = "workflowtest"
$testPassword = "TestPassword123!"

# Step 1: Register Test User
Write-Host "`n1. Registering test user..." -ForegroundColor Yellow
$registerBody = @{
    username = $testUsername
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" -Method POST -Headers $headers -Body $registerBody -ErrorAction Stop
    Write-Host "✅ User registered successfully" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "⚠️ User already exists, proceeding with login" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Login and Get Token
Write-Host "`n2. Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" -Method POST -Headers $headers -Body $loginBody -ErrorAction Stop
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.token
    Write-Host "✅ Login successful, token obtained" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        Write-Host "Error details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
    exit 1
}

# Step 3: Test Health Check
Write-Host "`n3. Testing health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$baseUrl/api/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Health check passed" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test Files List Endpoint
Write-Host "`n4. Testing files list endpoint..." -ForegroundColor Yellow
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

try {
    $filesResponse = Invoke-WebRequest -Uri "$baseUrl/api/files" -Method GET -Headers $authHeaders -ErrorAction Stop
    $filesData = $filesResponse.Content | ConvertFrom-Json
    Write-Host "✅ Files list endpoint working" -ForegroundColor Green
    Write-Host "Current file count: $(if($filesData) { $filesData.Count } else { 0 })" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Files list failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        Write-Host "Error details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
}

# Step 5: Create Test File for Upload
Write-Host "`n5. Creating test file..." -ForegroundColor Yellow
$testContent = "This is a test file for CryptoVault encrypted upload workflow.`nTimestamp: $(Get-Date)`nFile size test data: $('x' * 100)"
$testFileName = "cryptovault_test_$(Get-Date -Format 'yyyyMMdd_HHmmss').txt"
$testFilePath = Join-Path $env:TEMP $testFileName

Set-Content -Path $testFilePath -Value $testContent -Encoding UTF8
Write-Host "✅ Test file created: $testFilePath" -ForegroundColor Green
Write-Host "File size: $((Get-Item $testFilePath).Length) bytes" -ForegroundColor Cyan

# Step 6: Test File Upload
Write-Host "`n6. Testing file upload..." -ForegroundColor Yellow
try {
    # Prepare multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$testFileName`"",
        "Content-Type: text/plain$LF",
        $fileEnc,
        "--$boundary",
        "Content-Disposition: form-data; name=`"original_filename`"$LF",
        $testFileName,
        "--$boundary",
        "Content-Disposition: form-data; name=`"content_type`"$LF",
        "text/plain",
        "--$boundary--$LF"
    ) -join $LF
    
    $uploadHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    $uploadResponse = Invoke-WebRequest -Uri "$baseUrl/api/files" -Method POST -Headers $uploadHeaders -Body $bodyLines -ErrorAction Stop
    $uploadData = $uploadResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ File upload successful!" -ForegroundColor Green
    Write-Host "File ID: $($uploadData.file_id)" -ForegroundColor Cyan
    Write-Host "Upload response: $($uploadResponse.Content)" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ File upload failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        Write-Host "Error details: $($reader.ReadToEnd())" -ForegroundColor Red
    }
} finally {
    # Cleanup test file
    if (Test-Path $testFilePath) {
        Remove-Item $testFilePath -Force
        Write-Host "🧹 Test file cleaned up" -ForegroundColor Gray
    }
}

# Step 7: Verify File List Again
Write-Host "`n7. Verifying file was added..." -ForegroundColor Yellow
try {
    $filesResponse2 = Invoke-WebRequest -Uri "$baseUrl/api/files" -Method GET -Headers $authHeaders -ErrorAction Stop
    $filesData2 = $filesResponse2.Content | ConvertFrom-Json
    Write-Host "✅ Files list retrieved" -ForegroundColor Green
    Write-Host "Updated file count: $(if($filesData2) { $filesData2.Count } else { 0 })" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Final file list check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Backend URL: $baseUrl" -ForegroundColor Cyan
Write-Host "Frontend URL: http://localhost:5174" -ForegroundColor Cyan
Write-Host "You can now test the upload functionality through the web interface!" -ForegroundColor Yellow