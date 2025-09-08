# CryptoVaultX Backend API - Sample curl Requests

## 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

**Expected Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-09-05T12:45:20.332Z",
  "uptime": 2.26,
  "database": "connected"
}
```

## 2. User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sagar Kumar",
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (201):**
```json
{
  "success": true,
  "user": {
    "id": 7,
    "name": "Sagar Kumar",
    "username": "sagar",
    "email": "sagar@example.com"
  }
}
```

**Error Response (409) - User exists:**
```json
{
  "error": "User with this email already exists"
}
```

**Error Response (400) - Validation error:**
```json
{
  "error": "Validation failed",
  "errors": [
    {
      "msg": "Password must be at least 6 characters long",
      "param": "password",
      "location": "body"
    }
  ]
}
```

## 3. User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsImVtYWlsIjoic2FnYXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InNhZ2FyIiwiaWF0IjoxNzU3MDc2MzIxLCJleHAiOjE3NTc2ODExMjF9.2vMG6QnRVQse-fOrM0z9uSwhMHfBg3o7G3bud0u2-cc",
  "user": {
    "id": 7,
    "name": "Sagar Kumar",
    "username": "sagar",
    "email": "sagar@example.com"
  }
}
```

**Error Response (401) - Invalid credentials:**
```json
{
  "error": "Invalid email or password"
}
```

## 4. Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjcsImVtYWlsIjoic2FnYXJAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InNhZ2FyIiwiaWF0IjoxNzU3MDc2MzIxLCJleHAiOjE3NTc2ODExMjF9.2vMG6QnRVQse-fOrM0z9uSwhMHfBg3o7G3bud0u2-cc"
```

**Expected Response (200):**
```json
{
  "id": 7,
  "name": "Sagar Kumar",
  "username": "sagar",
  "email": "sagar@example.com",
  "created_at": null,
  "updated_at": null
}
```

**Error Response (401) - Invalid token:**
```json
{
  "error": "Invalid token."
}
```

## 5. Logout (Optional)
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## PowerShell Examples

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method Get
```

### Register User
```powershell
$registerData = @{
    name = "Sagar Kumar"
    email = "sagar@example.com" 
    password = "SecurePass123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $registerData -ContentType "application/json"
```

### Login User
```powershell
$loginData = @{
    email = "sagar@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
$token = $loginResponse.token
```

### Get Profile
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/me" -Method Get -Headers $headers
```
