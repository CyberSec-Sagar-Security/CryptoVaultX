ryptoVault API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
CryptoVault uses JWT (JSON Web Tokens) for authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "message": "Success message",
  "data": { ... },
  "error": "Error message (if any)"
}
```

## Endpoints

### Health Check

#### GET /api/health
Check service health status.

**Response:**
```json
{
  "status": "ok",
  "service": "CryptoVault Backend",
  "version": "1.0.0",
  "timestamp": "2025-08-31T12:00:00.000000"
}
```

---

## Authentication Endpoints

### Register User

#### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Password Requirements:**
- At least 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-31T12:00:00.000000",
    "is_active": true
  }
}
```

**Error Responses:**
- `400` - Invalid input (missing fields, weak password, invalid email)
- `409` - Email already registered

### Login User

#### POST /api/auth/login
Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-31T12:00:00.000000",
    "is_active": true
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Token Expiration:**
- Access Token: 15 minutes
- Refresh Token: 7 days

**Error Responses:**
- `400` - Invalid input
- `401` - Invalid credentials

### Refresh Token

#### POST /api/auth/refresh
Get a new access token using refresh token.

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Success Response (200):**
```json
{
  "message": "Token refreshed successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token
- `404` - User not found

### Get Current User

#### GET /api/auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2025-08-31T12:00:00.000000",
    "updated_at": "2025-08-31T12:00:00.000000",
    "is_active": true
  }
}
```

**Error Responses:**
- `401` - Invalid or expired token
- `404` - User not found

### Logout

#### POST /api/auth/logout
Logout current user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "message": "Logout successful. Please remove the token from client storage."
}
```

**Note:** Currently implements client-side logout. In production, consider implementing server-side token blacklisting.

---

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input data |
| 401  | Unauthorized - Invalid or missing token |
| 404  | Not Found - Resource not found |
| 405  | Method Not Allowed |
| 409  | Conflict - Resource already exists |
| 413  | Payload Too Large - File too large |
| 500  | Internal Server Error |

---

## Example Usage

### Registration Flow
```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Smith",
    "email": "alice@example.com", 
    "password": "SecurePass123!"
  }'
```

### Login Flow
```bash
# Login and get tokens
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123!"
  }'

# Save the access_token from response
export ACCESS_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

### Accessing Protected Endpoints
```bash
# Get current user info
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  http://localhost:5000/api/auth/me
```

### Token Refresh
```bash
# Use refresh token to get new access token
export REFRESH_TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
```

### Future Tables
- `files` - File metadata storage
- `shares` - File sharing relationships

---

## Security Features

- **Password Hashing**: bcrypt with salt
- **JWT Tokens**: HS256 algorithm
- **CORS Protection**: Configured origins
- **Input Validation**: Email format, password strength
- **SQL Injection Prevention**: SQLAlchemy ORM
- **Token Expiration**: Short-lived access tokens
