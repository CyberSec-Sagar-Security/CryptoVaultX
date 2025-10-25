# PowerShell test script for PostgreSQL file storage with quota enforcement
# Test upload, quota enforcement, and download of encrypted files

Write-Host "=== CryptoVault PostgreSQL Storage Test ===" -ForegroundColor Green

# Configuration
$BASE_URL = "http://localhost:5000"
$TEST_USER_EMAIL = "test@example.com"
$TEST_USER_PASSWORD = "testpassword123"

# Helper function to make HTTP requests
function Invoke-APIRequest {
    param(
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$ContentType = "application/json"
    )
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = $ContentType
        }
        
        if ($Body) {
            if ($ContentType -eq "application/json") {
                $params.Body = $Body | ConvertTo-Json -Depth 10
            } else {
                $params.Body = $Body
            }
        }
        
        return Invoke-RestMethod @params
    }
    catch {
        Write-Host "API Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
        throw
    }
}

# Step 1: Login to get access token
Write-Host "`n1. Logging in..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = $TEST_USER_EMAIL
        password = $TEST_USER_PASSWORD
    }
    
    $loginResponse = Invoke-APIRequest -Method "POST" -Url "$BASE_URL/api/auth/login" -Body $loginData
    $accessToken = $loginResponse.access_token
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   Access token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
}
catch {
    Write-Host "❌ Login failed. Make sure backend is running and user exists." -ForegroundColor Red
    Write-Host "   You may need to register the user first." -ForegroundColor Yellow
    exit 1
}

# Step 2: Check initial quota
Write-Host "`n2. Checking initial quota..." -ForegroundColor Yellow
try {
    $headers = @{ "Authorization" = "Bearer $accessToken" }
    $quotaResponse = Invoke-APIRequest -Method "GET" -Url "$BASE_URL/api/files/quota" -Headers $headers
    
    Write-Host "✅ Initial quota check successful" -ForegroundColor Green
    Write-Host "   Used: $($quotaResponse.storage_info.used_mb) MB / $($quotaResponse.storage_info.quota_mb) MB" -ForegroundColor Gray
    Write-Host "   Remaining: $($quotaResponse.storage_info.remaining_mb) MB" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Quota check failed" -ForegroundColor Red
    throw
}

# Step 3: Create test encrypted file
Write-Host "`n3. Creating test encrypted file..." -ForegroundColor Yellow
$testFilePath = "$env:TEMP\cryptovault_test_file.txt"
$testContent = "This is a test file for CryptoVault PostgreSQL storage.`nContent includes multiple lines.`nTest timestamp: $(Get-Date)"
Set-Content -Path $testFilePath -Value $testContent -Encoding UTF8

# Simulate client-side encryption (base64 encoding for demo)
$fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
$ciphertext = [Convert]::ToBase64String($fileBytes)  # Simulate encrypted content
$iv = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes("test_iv_12345678"))  # Simulate IV

Write-Host "✅ Test file created" -ForegroundColor Green
Write-Host "   Path: $testFilePath" -ForegroundColor Gray
Write-Host "   Size: $($fileBytes.Length) bytes" -ForegroundColor Gray

# Step 4: Test file upload
Write-Host "`n4. Testing file upload..." -ForegroundColor Yellow
try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $contentType = "multipart/form-data; boundary=$boundary"
    
    # Create metadata JSON
    $metadata = @{
        originalFilename = "test_encrypted_file.txt"
        ivBase64 = $iv
        algo = "AES-256-GCM"
    } | ConvertTo-Json -Compress
    
    # Create multipart body
    $body = @"
--$boundary
Content-Disposition: form-data; name="metadata"

$metadata
--$boundary
Content-Disposition: form-data; name="file"; filename="test_encrypted_file.txt"
Content-Type: application/octet-stream

$ciphertext
--$boundary--
"@
    
    $uploadResponse = Invoke-APIRequest -Method "POST" -Url "$BASE_URL/api/files/" -Headers $headers -Body $body -ContentType $contentType
    
    Write-Host "✅ File upload successful" -ForegroundColor Green
    Write-Host "   File ID: $($uploadResponse.id)" -ForegroundColor Gray
    Write-Host "   Size: $($uploadResponse.size_bytes) bytes" -ForegroundColor Gray
    
    $uploadedFileId = $uploadResponse.id
}
catch {
    Write-Host "❌ File upload failed" -ForegroundColor Red
    throw
}

# Step 5: Test quota after upload
Write-Host "`n5. Checking quota after upload..." -ForegroundColor Yellow
try {
    $quotaResponse = Invoke-APIRequest -Method "GET" -Url "$BASE_URL/api/files/quota" -Headers $headers
    
    Write-Host "✅ Quota check after upload successful" -ForegroundColor Green
    Write-Host "   Used: $($quotaResponse.storage_info.used_mb) MB / $($quotaResponse.storage_info.quota_mb) MB" -ForegroundColor Gray
    Write-Host "   Usage: $($quotaResponse.storage_info.usage_percentage)%" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Quota check failed" -ForegroundColor Red
    throw
}

# Step 6: Test file listing
Write-Host "`n6. Testing file listing..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-APIRequest -Method "GET" -Url "$BASE_URL/api/files/list" -Headers $headers
    
    Write-Host "✅ File listing successful" -ForegroundColor Green
    Write-Host "   Total files: $($listResponse.files.Count)" -ForegroundColor Gray
    Write-Host "   Storage used: $($listResponse.storage_info.used_mb) MB" -ForegroundColor Gray
    
    foreach ($file in $listResponse.files) {
        Write-Host "   - $($file.original_filename) ($($file.size_bytes) bytes)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "❌ File listing failed" -ForegroundColor Red
    throw
}

# Step 7: Test file download
Write-Host "`n7. Testing file download..." -ForegroundColor Yellow
try {
    $downloadUrl = "$BASE_URL/api/files/$uploadedFileId"
    $downloadResponse = Invoke-WebRequest -Uri $downloadUrl -Headers $headers -Method GET
    
    Write-Host "✅ File download successful" -ForegroundColor Green
    Write-Host "   Content-Type: $($downloadResponse.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "   X-File-Name: $($downloadResponse.Headers.'X-File-Name')" -ForegroundColor Gray
    Write-Host "   X-File-IV: $($downloadResponse.Headers.'X-File-IV')" -ForegroundColor Gray
    Write-Host "   Downloaded size: $($downloadResponse.Content.Length) bytes" -ForegroundColor Gray
}
catch {
    Write-Host "❌ File download failed" -ForegroundColor Red
    throw
}

# Step 8: Test file deletion
Write-Host "`n8. Testing file deletion..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-APIRequest -Method "DELETE" -Url "$BASE_URL/api/files/$uploadedFileId" -Headers $headers
    
    Write-Host "✅ File deletion successful" -ForegroundColor Green
    Write-Host "   Message: $($deleteResponse.message)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ File deletion failed" -ForegroundColor Red
    throw
}

# Step 9: Verify deletion
Write-Host "`n9. Verifying file deletion..." -ForegroundColor Yellow
try {
    $listResponse = Invoke-APIRequest -Method "GET" -Url "$BASE_URL/api/files/list" -Headers $headers
    
    Write-Host "✅ Verification successful" -ForegroundColor Green
    Write-Host "   Remaining files: $($listResponse.files.Count)" -ForegroundColor Gray
    Write-Host "   Storage used: $($listResponse.storage_info.used_mb) MB" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Verification failed" -ForegroundColor Red
    throw
}

# Cleanup
Remove-Item -Path $testFilePath -Force -ErrorAction SilentlyContinue

Write-Host "`n=== All tests completed successfully! ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run the migration: psql -U postgres -d cryptovault_db -f migrations/20251026_create_files_table.sql" -ForegroundColor White
Write-Host "2. Start backend: python app.py" -ForegroundColor White
Write-Host "3. Start frontend: npm run dev" -ForegroundColor White
Write-Host "4. Test the quota enforcement with larger files" -ForegroundColor White