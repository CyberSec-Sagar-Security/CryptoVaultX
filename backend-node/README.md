# CryptoVaultX Backend API

Node.js backend for CryptoVaultX with authentication, built with Express, PostgreSQL, and JWT.

## Features

- 🔐 JWT-based authentication
- 🛡️ Password hashing with bcrypt (saltRounds: 12)
- ✅ Input validation with express-validator
- 🚦 Rate limiting for auth endpoints
- 🔒 CORS protection
- 📊 Health check endpoint
- 🗄️ PostgreSQL with Knex.js ORM

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

### 3. Setup Database
Make sure PostgreSQL is running and create the database:
```bash
# Create database (run in PostgreSQL)
CREATE DATABASE cryptovault_db;
CREATE USER cryptovault_user WITH PASSWORD 'sql123';
GRANT ALL PRIVILEGES ON DATABASE cryptovault_db TO cryptovault_user;
```

### 4. Run Migrations
```bash
npm run migrate
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Health Check
- **GET** `/api/health` - Check server and database status

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **GET** `/api/auth/me` - Get user profile (requires auth)
- **POST** `/api/auth/logout` - Logout user (requires auth)

## API Examples

### 1. Health Check
```bash
curl -X GET http://localhost:5000/api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2025-09-05T10:30:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

### 2. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sagar Kumar",
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Sagar Kumar",
    "email": "sagar@example.com"
  }
}
```

**Error Response (409) - Email exists:**
```json
{
  "error": "User with this email already exists"
}
```

**Error Response (400) - Validation error:**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### 3. Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sagar@example.com",
    "password": "SecurePass123"
  }'
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Sagar Kumar",
    "email": "sagar@example.com",
    "role": "user"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid email or password"
}
```

### 4. Get User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Sagar Kumar",
  "email": "sagar@example.com",
  "role": "user",
  "is_email_verified": false,
  "created_at": "2025-09-05T10:30:00.000Z"
}
```

**Error Response (401) - No token:**
```json
{
  "error": "Access denied. No token provided or invalid format."
}
```

### 5. Logout User
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Rate Limiting

Auth endpoints (`/api/auth/register`, `/api/auth/login`) are rate limited:
- **5 requests per 15 minutes** per IP address
- Returns 429 status code when limit exceeded

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  role TEXT DEFAULT 'user'
);

CREATE INDEX idx_users_email ON users(email);
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_ORIGIN` | CORS allowed origin | `http://localhost:5173` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `5` |

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Signed tokens with expiration
- **Input Validation**: express-validator for all inputs
- **Rate Limiting**: Prevents brute force attacks
- **CORS Protection**: Configured for frontend origin
- **Helmet**: Security headers
- **Error Handling**: No sensitive data in error responses

## Development Commands

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run database migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Run database seeds
npm run seed
```

## Project Structure

```
backend-node/
├── middleware/
│   ├── auth.js          # JWT authentication middleware
│   ├── rateLimiter.js   # Rate limiting middleware
│   └── validation.js    # Input validation middleware
├── migrations/
│   └── 20250905000001_create_users_table.js
├── routes/
│   ├── auth.js          # Authentication routes
│   └── health.js        # Health check routes
├── .env                 # Environment variables
├── .env.example         # Environment template
├── database.js          # Database connection
├── knexfile.js          # Knex configuration
├── package.json         # Dependencies and scripts
├── server.js            # Main server file
└── README.md            # This file
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created (registration success) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid credentials/token) |
| 409 | Conflict (email already exists) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
| 503 | Service Unavailable (database error) |
