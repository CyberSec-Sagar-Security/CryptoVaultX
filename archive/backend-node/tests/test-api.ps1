# CryptoVaultX Backend API Test Scripts (PowerShell)
# Run these commands to test the API endpoints

$API_BASE = "http://localhost:5000/api"

Write-Host "🧪 Testing CryptoVaultX Backend API" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE/health" -Method Get
    $response | ConvertTo-Json -Depth 10
    Write-Host "Status: 200" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test 2: Register User
Write-Host "`n2. Testing User Registration..." -ForegroundColor Yellow
$registerData = @{
    name = "Sagar Kumar"
    email = "sagar@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method Post -Body $registerData -ContentType "application/json"
    $registerResponse | ConvertTo-Json -Depth 10
    Write-Host "Status: 201" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}

# Test 3: Login User
Write-Host "`n3. Testing User Login..." -ForegroundColor Yellow
$loginData = @{
    email = "sagar@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    $loginResponse | ConvertTo-Json -Depth 10
    Write-Host "Status: 200" -ForegroundColor Green
    
    # Extract token for next request
    $token = $loginResponse.token
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    $token = $null
}

# Test 4: Get User Profile
if ($token) {
    Write-Host "`n4. Testing Get User Profile..." -ForegroundColor Yellow
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    
    try {
        $profileResponse = Invoke-RestMethod -Uri "$API_BASE/auth/me" -Method Get -Headers $headers
        $profileResponse | ConvertTo-Json -Depth 10
        Write-Host "Status: 200" -ForegroundColor Green
    } catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
} else {
    Write-Host "`n4. Skipping profile test - no valid token received" -ForegroundColor Yellow
}

# Test 5: Test Invalid Login
Write-Host "`n5. Testing Invalid Login..." -ForegroundColor Yellow
$invalidLoginData = @{
    email = "wrong@example.com"
    password = "wrongpassword"
} | ConvertTo-Json

try {
    $invalidResponse = Invoke-RestMethod -Uri "$API_BASE/auth/login" -Method Post -Body $invalidLoginData -ContentType "application/json"
    $invalidResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected error: $($_.Exception.Message)" -ForegroundColor Cyan
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Cyan
}

# Test 6: Test Validation Error
Write-Host "`n6. Testing Validation Error (short password)..." -ForegroundColor Yellow
$invalidRegisterData = @{
    name = "Test User"
    email = "test@example.com"
    password = "123"
} | ConvertTo-Json

try {
    $validationResponse = Invoke-RestMethod -Uri "$API_BASE/auth/register" -Method Post -Body $invalidRegisterData -ContentType "application/json"
    $validationResponse | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Expected validation error: $($_.Exception.Message)" -ForegroundColor Cyan
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Cyan
}

Write-Host "`n✅ API Testing Complete!" -ForegroundColor Green
