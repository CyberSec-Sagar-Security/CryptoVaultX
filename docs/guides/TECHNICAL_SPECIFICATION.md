# CryptoVault - Technical Specification

## Document Information
- **Version:** 1.0
- **Date:** October 12, 2025
- **Status:** Living Document
- **Author:** Sagar (CyberSec-Sagar-Security)

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [API Specification](#api-specification)
5. [Encryption Implementation](#encryption-implementation)
6. [Authentication & Authorization](#authentication--authorization)
7. [Frontend Architecture](#frontend-architecture)
8. [Backend Architecture](#backend-architecture)
9. [Security Considerations](#security-considerations)
10. [Performance Optimization](#performance-optimization)

---

## 1. System Overview

### 1.1 High-Level Architecture

CryptoVault follows a client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                           CLIENT TIER                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  React Application (Browser)                               │ │
│  │  - UI Components (shadcn/ui)                               │ │
│  │  - State Management (Context API)                          │ │
│  │  - Routing (React Router)                                  │ │
│  │  - Client-Side Encryption (Web Crypto API)                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               ▲  │
                               │  │ HTTPS/TLS
                               │  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         APPLICATION TIER                         │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Flask Application (Python)                                │ │
│  │  - REST API Endpoints                                      │ │
│  │  - JWT Authentication Middleware                           │ │
│  │  - Request Validation                                      │ │
│  │  - Business Logic                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               ▲  │
                               │  │ SQLAlchemy ORM
                               │  ▼
┌─────────────────────────────────────────────────────────────────┐
│                           DATA TIER                              │
│  ┌─────────────────────┐         ┌────────────────────────────┐│
│  │  PostgreSQL DB      │         │  File Storage (Local)      ││
│  │  - User Metadata    │         │  - Encrypted Files (.enc)  ││
│  │  - File Metadata    │         │  - UUID Naming             ││
│  │  - Share Records    │         │                            ││
│  └─────────────────────┘         └────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

#### File Upload Flow
```
User Selects File → Generate AES Key → Encrypt File (AES-256-GCM)
         │                                      │
         ▼                                      ▼
   Generate RSA Keys → Wrap AES Key → Store Wrapped Key + Upload
         │                  │                   │
         ▼                  ▼                   ▼
   Store Private Key   Send to Server    Server Stores Encrypted File
```

#### File Download Flow
```
Request File → Server Returns Encrypted File + Wrapped Key
      │                           │
      ▼                           ▼
Retrieve Private Key → Unwrap AES Key → Decrypt File
      │                           │              │
      ▼                           ▼              ▼
  Verify User       Verify Authentication Tag   Return Plaintext
```

---

## 2. Technology Stack

### 2.1 Frontend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.3.1 | UI library |
| **Language** | TypeScript | 5.6+ | Type-safe development |
| **Build Tool** | Vite | 6.3.5 | Fast dev server & bundler |
| **Routing** | React Router | 6.28.0 | Client-side routing |
| **UI Library** | shadcn/ui | Latest | Component library |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first CSS |
| **HTTP Client** | Fetch API | Native | API communication |
| **Crypto** | Web Crypto API | Native | Browser cryptography |
| **State Mgmt** | Context API | Native | Global state |

### 2.2 Backend Technologies

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Flask | 3.1.0 | Web framework |
| **Language** | Python | 3.13+ | Backend logic |
| **Database** | PostgreSQL | 17 | Relational database |
| **ORM** | SQLAlchemy | 2.0+ | Database abstraction |
| **Auth** | PyJWT | 2.10.1 | JWT token handling |
| **Password** | bcrypt | 4.2.1 | Password hashing |
| **CORS** | Flask-CORS | 5.0.0 | Cross-origin requests |
| **Validation** | Marshmallow | 3.23.2 | Schema validation |

### 2.3 Development Tools

| Tool | Purpose |
|------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Git** | Version control |
| **GitHub** | Repository hosting |
| **VS Code** | IDE |
| **Postman** | API testing |
| **pgAdmin** | Database management |

---

## 3. Database Design

### 3.1 Entity-Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     Users       │         │      Files      │         │     Shares      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ id (PK)         │────┐    │ id (PK)         │    ┌────│ id (PK)         │
│ username        │    │    │ user_id (FK)    │────┤    │ file_id (FK)    │
│ email (UNIQUE)  │    └───→│ filename        │    │    │ owner_id (FK)   │
│ password_hash   │         │ file_size       │    │    │ shared_with_id  │
│ created_at      │         │ file_type       │    │    │ wrapped_key     │
│ updated_at      │         │ file_path       │    │    │ permissions     │
│ is_active       │         │ wrapped_key     │    │    │ created_at      │
└─────────────────┘         │ encryption_iv   │    │    │ expires_at      │
                            │ auth_tag        │    │    └─────────────────┘
                            │ uploaded_at     │    │
                            │ is_deleted      │    │
                            └─────────────────┘    │
                                     │             │
                                     └─────────────┘
```

### 3.2 Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

#### Files Table
```sql
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL UNIQUE,
    wrapped_key TEXT NOT NULL,
    encryption_iv VARCHAR(100) NOT NULL,
    auth_tag VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    
    CONSTRAINT file_size_positive CHECK (file_size > 0)
);

CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_uploaded_at ON files(uploaded_at DESC);
CREATE INDEX idx_files_is_deleted ON files(is_deleted) WHERE is_deleted = FALSE;
```

#### Shares Table
```sql
CREATE TABLE shares (
    id SERIAL PRIMARY KEY,
    file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shared_with_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wrapped_key TEXT NOT NULL,
    permissions VARCHAR(20) DEFAULT 'read',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(file_id, shared_with_id),
    CONSTRAINT owner_not_recipient CHECK (owner_id != shared_with_id),
    CONSTRAINT valid_permissions CHECK (permissions IN ('read', 'write', 'admin'))
);

CREATE INDEX idx_shares_file_id ON shares(file_id);
CREATE INDEX idx_shares_shared_with ON shares(shared_with_id);
CREATE INDEX idx_shares_active ON shares(is_active) WHERE is_active = TRUE;
```

### 3.3 SQLAlchemy Models

#### User Model
```python
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    last_login = db.Column(db.DateTime)
    
    files = db.relationship('File', backref='owner', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)
```

#### File Model
```python
class File(db.Model):
    __tablename__ = 'files'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    filename = db.Column(db.String(255), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    file_type = db.Column(db.String(100))
    file_path = db.Column(db.String(500), nullable=False, unique=True)
    wrapped_key = db.Column(db.Text, nullable=False)
    encryption_iv = db.Column(db.String(100), nullable=False)
    auth_tag = db.Column(db.String(100), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = db.Column(db.Boolean, default=False, index=True)
    
    shares = db.relationship('Share', backref='file', lazy='dynamic', cascade='all, delete-orphan')
```

---

## 4. API Specification

### 4.1 Base URL
```
Development: http://localhost:5000
Production: https://api.cryptovault.com
```

### 4.2 Authentication Endpoints

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Validation Rules:**
- Username: 3-80 chars, alphanumeric + underscore
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char

#### POST /auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### 4.3 File Management Endpoints

#### POST /files/upload
Upload an encrypted file.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
file: <encrypted_file_binary>
filename: "document.pdf"
file_size: 1048576
file_type: "application/pdf"
wrapped_key: "base64_encoded_wrapped_key"
encryption_iv: "base64_encoded_iv"
auth_tag: "base64_encoded_auth_tag"
```

**Response (201 Created):**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 42,
    "filename": "document.pdf",
    "file_size": 1048576,
    "file_type": "application/pdf",
    "uploaded_at": "2025-10-12T10:30:00Z"
  }
}
```

#### GET /files
List all files for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "files": [
    {
      "id": 42,
      "filename": "document.pdf",
      "file_size": 1048576,
      "file_type": "application/pdf",
      "uploaded_at": "2025-10-12T10:30:00Z"
    }
  ],
  "total": 1
}
```

#### GET /files/:id
Get file metadata and download URL.

**Response (200 OK):**
```json
{
  "id": 42,
  "filename": "document.pdf",
  "file_size": 1048576,
  "file_type": "application/pdf",
  "wrapped_key": "base64_encoded_wrapped_key",
  "encryption_iv": "base64_encoded_iv",
  "auth_tag": "base64_encoded_auth_tag",
  "download_url": "/files/42/download"
}
```

#### GET /files/:id/download
Download encrypted file.

**Response (200 OK):**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="document.pdf.enc"

<encrypted_file_binary>
```

#### DELETE /files/:id
Soft delete a file.

**Response (200 OK):**
```json
{
  "message": "File deleted successfully"
}
```

### 4.4 File Sharing Endpoints

#### POST /shares
Share a file with another user.

**Request:**
```json
{
  "file_id": 42,
  "shared_with_email": "jane@example.com",
  "wrapped_key": "base64_re_encrypted_key",
  "permissions": "read",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Response (201 Created):**
```json
{
  "message": "File shared successfully",
  "share": {
    "id": 10,
    "file_id": 42,
    "shared_with": "jane@example.com",
    "permissions": "read",
    "expires_at": "2025-12-31T23:59:59Z"
  }
}
```

### 4.5 Health Check

#### GET /health
Check system health status.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-12T10:30:00Z"
}
```

---

## 5. Encryption Implementation

### 5.1 Encryption Algorithm Details

**File Encryption:**
- Algorithm: AES-256-GCM (Galois/Counter Mode)
- Key Size: 256 bits (32 bytes)
- IV Size: 96 bits (12 bytes)
- Authentication Tag: 128 bits (16 bytes)

**Key Wrapping:**
- Algorithm: RSA-OAEP (Optimal Asymmetric Encryption Padding)
- Hash: SHA-256
- Key Size: 2048 bits
- Padding: OAEP with SHA-256 and MGF1

### 5.2 Encryption Workflow

#### File Encryption Process
```typescript
async function encryptFile(file: File): Promise<EncryptedFileData> {
  // 1. Generate random AES key
  const aesKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // 2. Generate random IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // 3. Read file as ArrayBuffer
  const fileData = await file.arrayBuffer();
  
  // 4. Encrypt file data
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    aesKey,
    fileData
  );
  
  // 5. Extract authentication tag (last 16 bytes)
  const ciphertext = new Uint8Array(encryptedData);
  const authTag = ciphertext.slice(-16);
  const encrypted = ciphertext.slice(0, -16);
  
  // 6. Export AES key for wrapping
  const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey);
  
  // 7. Wrap AES key with RSA public key
  const wrappedKey = await wrapKey(exportedKey, rsaPublicKey);
  
  return {
    encryptedData: encrypted,
    wrappedKey: arrayBufferToBase64(wrappedKey),
    iv: arrayBufferToBase64(iv),
    authTag: arrayBufferToBase64(authTag)
  };
}
```

#### Key Wrapping Process
```typescript
async function wrapKey(
  aesKey: ArrayBuffer,
  rsaPublicKey: CryptoKey
): Promise<ArrayBuffer> {
  return await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    rsaPublicKey,
    aesKey
  );
}
```

#### File Decryption Process
```typescript
async function decryptFile(
  encryptedData: ArrayBuffer,
  wrappedKey: string,
  iv: string,
  authTag: string,
  rsaPrivateKey: CryptoKey
): Promise<ArrayBuffer> {
  // 1. Unwrap AES key
  const wrappedKeyBuffer = base64ToArrayBuffer(wrappedKey);
  const aesKeyBuffer = await window.crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    rsaPrivateKey,
    wrappedKeyBuffer
  );
  
  // 2. Import AES key
  const aesKey = await window.crypto.subtle.importKey(
    'raw',
    aesKeyBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // 3. Reconstruct encrypted data with auth tag
  const ivBuffer = base64ToArrayBuffer(iv);
  const authTagBuffer = base64ToArrayBuffer(authTag);
  const encryptedBuffer = new Uint8Array(encryptedData);
  const dataWithTag = new Uint8Array([...encryptedBuffer, ...new Uint8Array(authTagBuffer)]);
  
  // 4. Decrypt file data
  const decryptedData = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    aesKey,
    dataWithTag
  );
  
  return decryptedData;
}
```

### 5.3 Key Management

#### RSA Key Pair Generation
```typescript
async function generateRSAKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
}
```

#### Key Storage Strategy
```typescript
// Store private key encrypted with user's password-derived key
async function storePrivateKey(
  privateKey: CryptoKey,
  userPassword: string
): Promise<void> {
  // 1. Derive key from password using PBKDF2
  const derivedKey = await deriveKeyFromPassword(userPassword);
  
  // 2. Export private key
  const exportedKey = await window.crypto.subtle.exportKey('pkcs8', privateKey);
  
  // 3. Encrypt private key with derived key
  const encryptedKey = await encryptWithDerivedKey(exportedKey, derivedKey);
  
  // 4. Store in localStorage (or secure storage)
  localStorage.setItem('encrypted_private_key', encryptedKey);
}

async function deriveKeyFromPassword(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use a stored salt (generated on registration)
  const salt = base64ToArrayBuffer(localStorage.getItem('key_salt')!);
  
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}
```

---

## 6. Authentication & Authorization

### 6.1 JWT Token Structure

**Token Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Token Payload:**
```json
{
  "sub": "1",
  "username": "johndoe",
  "email": "john@example.com",
  "iat": 1728731400,
  "exp": 1728817800
}
```

### 6.2 Authentication Middleware

```python
from functools import wraps
from flask import request, jsonify
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Get token from header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Authentication token is missing'}), 401
        
        try:
            # Decode JWT
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.get(data['sub'])
            
            if not current_user or not current_user.is_active:
                return jsonify({'message': 'Invalid or inactive user'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated
```

### 6.3 Password Requirements

**Validation Rules:**
```python
import re

def validate_password(password: str) -> tuple[bool, str]:
    """
    Validate password strength.
    Returns: (is_valid, error_message)
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one number"
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    
    return True, "Password is valid"
```

---

## 7. Frontend Architecture

### 7.1 Component Hierarchy

```
App
├── AuthProvider (Context)
│   └── AppRouter
│       ├── PublicRoutes
│       │   ├── LoginPage
│       │   ├── RegisterPage
│       │   ├── TermsOfService
│       │   └── PrivacyPolicy
│       │
│       └── ProtectedRoutes (requires auth)
│           ├── Dashboard
│           ├── FilesPage
│           ├── Upload
│           ├── SharesPage
│           └── ProfilePage
```

### 7.2 State Management

**Auth Context:**
```typescript
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
```

### 7.3 Service Layer

**API Service:**
```typescript
class ApiService {
  private baseURL = 'http://localhost:5000';
  private token: string | null = null;
  
  setToken(token: string) {
    this.token = token;
  }
  
  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const headers = new Headers(options.headers);
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return await response.json();
  }
  
  // Auth methods
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }
  
  // File methods
  async uploadFile(formData: FormData) {
    return this.request('/files/upload', {
      method: 'POST',
      body: formData
    });
  }
}
```

---

## 8. Backend Architecture

### 8.1 Application Structure

```python
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from config import Config

# Initialize extensions
db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=app.config['CORS_ORIGINS'])
    
    # Register blueprints
    from routes.auth import auth_bp
    from routes.files import files_bp
    from routes.shares import shares_bp
    from routes.health import health_bp
    
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(files_bp, url_prefix='/files')
    app.register_blueprint(shares_bp, url_prefix='/shares')
    app.register_blueprint(health_bp)
    
    # Error handlers
    register_error_handlers(app)
    
    return app
```

### 8.2 Configuration Management

```python
import os
from datetime import timedelta

class Config:
    # Application
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://cryptovault:secure_password@localhost:5432/cryptovault'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or SECRET_KEY
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    
    # File Upload
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100MB
    UPLOAD_FOLDER = 'uploads'
    ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx'}
    
    # CORS
    CORS_ORIGINS = ['http://localhost:5173', 'http://localhost:5174']
    
    # Security
    BCRYPT_LOG_ROUNDS = 12
```

---

## 9. Security Considerations

### 9.1 Threat Model

**Threats:**
1. Man-in-the-middle attacks → Mitigated by HTTPS/TLS
2. Unauthorized access → Mitigated by JWT authentication
3. Data breaches → Mitigated by client-side encryption
4. SQL injection → Mitigated by SQLAlchemy ORM
5. XSS attacks → Mitigated by React's default escaping
6. CSRF attacks → Mitigated by JWT tokens (stateless)
7. Brute force attacks → Mitigated by rate limiting (planned)

### 9.2 Security Best Practices

**Implemented:**
- ✅ HTTPS/TLS for all communications
- ✅ Client-side encryption before upload
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token-based authentication
- ✅ CORS protection
- ✅ Input validation
- ✅ SQL injection protection (ORM)

**Planned:**
- ⏳ Rate limiting on API endpoints
- ⏳ Input sanitization middleware
- ⏳ Security headers (CSP, HSTS, etc.)
- ⏳ Audit logging
- ⏳ Intrusion detection

---

## 10. Performance Optimization

### 10.1 Frontend Optimization

**Implemented:**
- Code splitting with React Router
- Lazy loading of components
- Vite build optimization
- Efficient re-renders with React.memo

**Planned:**
- Service workers for offline support
- Progressive Web App (PWA)
- File chunking for large uploads
- Virtual scrolling for file lists

### 10.2 Backend Optimization

**Implemented:**
- Database indexing on frequently queried columns
- Connection pooling (SQLAlchemy)
- Efficient query design

**Planned:**
- Redis caching layer
- CDN for static assets
- Database query optimization
- Load balancing

---

**Document Version:** 1.0  
**Last Updated:** October 12, 2025  
**Maintained By:** CyberSec-Sagar-Security
