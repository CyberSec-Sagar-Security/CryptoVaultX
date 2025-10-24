# CryptoVault API Documentation

## Overview
**Version:** 1.0  
**Base URL:** `http://localhost:5000`  
**Protocol:** HTTP/HTTPS  
**Authentication:** JWT Bearer Token  
**Content-Type:** application/json (except file uploads)

---

## Table of Contents
1. [Authentication](#authentication)
2. [File Management](#file-management)
3. [File Sharing](#file-sharing)
4. [Health Check](#health-check)
5. [Error Responses](#error-responses)
6. [Rate Limiting](#rate-limiting)
7. [Code Examples](#code-examples)

---

## Authentication

### Register User
Create a new user account.

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required

**Request Body:**
```json
{
  "username": "string (3-80 chars, alphanumeric)",
  "email": "string (valid email format)",
  "password": "string (min 8 chars, must contain uppercase, lowercase, number, special char)"
}
```

**Success Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2025-10-12T10:30:00Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `409 Conflict` - Username or email already exists

**Example:**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing credentials
- `401 Unauthorized` - Invalid credentials
- `403 Forbidden` - Account disabled

**Example:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

---

### Logout
Invalidate current session (client-side token removal).

**Endpoint:** `POST /auth/logout`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## File Management

### Upload File
Upload an encrypted file with metadata.

**Endpoint:** `POST /files/upload`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Encrypted file binary |
| `filename` | String | Yes | Original filename |
| `file_size` | Integer | Yes | File size in bytes |
| `file_type` | String | Yes | MIME type |
| `wrapped_key` | String | Yes | Base64 encrypted AES key |
| `encryption_iv` | String | Yes | Base64 initialization vector |
| `auth_tag` | String | Yes | Base64 authentication tag |

**Success Response:** `201 Created`
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 42,
    "filename": "document.pdf",
    "file_size": 1048576,
    "file_type": "application/pdf",
    "uploaded_at": "2025-10-12T10:30:00Z",
    "file_path": "e7d10f16-ee40-428f-87d4-ba6bd73cc709.enc"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or validation error
- `401 Unauthorized` - Invalid or missing token
- `413 Payload Too Large` - File exceeds size limit
- `500 Internal Server Error` - Upload failed

**Example (using JavaScript):**
```javascript
const formData = new FormData();
formData.append('file', encryptedFile);
formData.append('filename', 'document.pdf');
formData.append('file_size', '1048576');
formData.append('file_type', 'application/pdf');
formData.append('wrapped_key', wrappedKeyBase64);
formData.append('encryption_iv', ivBase64);
formData.append('auth_tag', authTagBase64);

const response = await fetch('http://localhost:5000/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

### List Files
Get all files for authenticated user.

**Endpoint:** `GET /files`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Integer | 1 | Page number |
| `per_page` | Integer | 20 | Items per page |
| `sort_by` | String | uploaded_at | Sort field |
| `order` | String | desc | Sort order (asc/desc) |

**Success Response:** `200 OK`
```json
{
  "files": [
    {
      "id": 42,
      "filename": "document.pdf",
      "file_size": 1048576,
      "file_type": "application/pdf",
      "uploaded_at": "2025-10-12T10:30:00Z",
      "is_shared": false
    },
    {
      "id": 43,
      "filename": "image.png",
      "file_size": 524288,
      "file_type": "image/png",
      "uploaded_at": "2025-10-12T11:15:00Z",
      "is_shared": true
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 2,
    "pages": 1
  }
}
```

**Example:**
```bash
curl -X GET "http://localhost:5000/files?page=1&per_page=20" \
  -H "Authorization: Bearer <jwt_token>"
```

---

### Get File Details
Retrieve metadata for a specific file.

**Endpoint:** `GET /files/:id`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response:** `200 OK`
```json
{
  "id": 42,
  "filename": "document.pdf",
  "file_size": 1048576,
  "file_type": "application/pdf",
  "uploaded_at": "2025-10-12T10:30:00Z",
  "wrapped_key": "base64_encoded_wrapped_key",
  "encryption_iv": "base64_encoded_iv",
  "auth_tag": "base64_encoded_auth_tag",
  "download_url": "/files/42/download",
  "is_shared": false,
  "owner": {
    "id": 1,
    "username": "johndoe"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not file owner
- `404 Not Found` - File doesn't exist

---

### Download File
Download encrypted file data.

**Endpoint:** `GET /files/:id/download`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response:** `200 OK`
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="document.pdf.enc"
Content-Length: 1048576

<encrypted_file_binary>
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - No access permission
- `404 Not Found` - File doesn't exist

**Example:**
```javascript
const response = await fetch(`http://localhost:5000/files/${fileId}/download`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const encryptedBlob = await response.blob();
```

---

### Delete File
Soft delete a file (mark as deleted).

**Endpoint:** `DELETE /files/:id`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response:** `200 OK`
```json
{
  "message": "File deleted successfully",
  "file_id": 42
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not file owner
- `404 Not Found` - File doesn't exist

---

## File Sharing

### Share File
Share an encrypted file with another user.

**Endpoint:** `POST /shares`  
**Authentication:** Required

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "file_id": 42,
  "shared_with_email": "jane@example.com",
  "wrapped_key": "base64_re_encrypted_key_for_recipient",
  "permissions": "read",
  "expires_at": "2025-12-31T23:59:59Z"
}
```

**Field Descriptions:**
- `file_id`: ID of file to share
- `shared_with_email`: Recipient's email address
- `wrapped_key`: AES key re-encrypted with recipient's RSA public key
- `permissions`: Access level (read, write, admin)
- `expires_at`: Optional expiration timestamp

**Success Response:** `201 Created`
```json
{
  "message": "File shared successfully",
  "share": {
    "id": 10,
    "file_id": 42,
    "owner": {
      "id": 1,
      "username": "johndoe"
    },
    "shared_with": {
      "id": 2,
      "username": "janedoe",
      "email": "jane@example.com"
    },
    "permissions": "read",
    "created_at": "2025-10-12T10:30:00Z",
    "expires_at": "2025-12-31T23:59:59Z"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not file owner
- `404 Not Found` - File or recipient not found
- `409 Conflict` - Already shared with user

---

### List Shared Files
Get files shared with current user.

**Endpoint:** `GET /shares/received`  
**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "shares": [
    {
      "id": 10,
      "file": {
        "id": 42,
        "filename": "document.pdf",
        "file_size": 1048576,
        "file_type": "application/pdf"
      },
      "owner": {
        "id": 1,
        "username": "johndoe"
      },
      "wrapped_key": "base64_encrypted_key",
      "permissions": "read",
      "shared_at": "2025-10-12T10:30:00Z",
      "expires_at": "2025-12-31T23:59:59Z"
    }
  ],
  "total": 1
}
```

---

### List My Shares
Get files current user has shared with others.

**Endpoint:** `GET /shares/sent`  
**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "shares": [
    {
      "id": 10,
      "file": {
        "id": 42,
        "filename": "document.pdf"
      },
      "shared_with": {
        "id": 2,
        "username": "janedoe",
        "email": "jane@example.com"
      },
      "permissions": "read",
      "shared_at": "2025-10-12T10:30:00Z",
      "is_active": true
    }
  ],
  "total": 1
}
```

---

### Revoke Share
Remove sharing access for a user.

**Endpoint:** `DELETE /shares/:id`  
**Authentication:** Required

**Success Response:** `200 OK`
```json
{
  "message": "Share revoked successfully",
  "share_id": 10
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid token
- `403 Forbidden` - Not share owner
- `404 Not Found` - Share doesn't exist

---

## Health Check

### System Health
Check API and database connectivity.

**Endpoint:** `GET /health`  
**Authentication:** Not required

**Success Response:** `200 OK`
```json
{
  "status": "healthy",
  "timestamp": "2025-10-12T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": {
      "status": "connected",
      "response_time_ms": 5
    },
    "storage": {
      "status": "available",
      "free_space_mb": 50000
    }
  }
}
```

**Error Response:** `503 Service Unavailable`
```json
{
  "status": "unhealthy",
  "timestamp": "2025-10-12T10:30:00Z",
  "services": {
    "database": {
      "status": "disconnected",
      "error": "Connection timeout"
    }
  }
}
```

---

## Error Responses

### Standard Error Format
All error responses follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "specific error details"
    }
  },
  "timestamp": "2025-10-12T10:30:00Z",
  "path": "/api/endpoint"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 413 | Payload Too Large | File size exceeds limit |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `TOKEN_EXPIRED` | 401 | JWT token has expired |
| `TOKEN_INVALID` | 401 | JWT token is malformed |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `USER_EXISTS` | 409 | Username or email already registered |
| `FILE_NOT_FOUND` | 404 | Requested file doesn't exist |
| `ACCESS_DENIED` | 403 | User lacks permission |
| `FILE_TOO_LARGE` | 413 | File exceeds size limit |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Rate Limiting

**Current Limits:**
- Authentication endpoints: 5 requests per minute
- File upload: 10 requests per hour
- File download: 100 requests per hour
- Other endpoints: 100 requests per minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1728731400
```

**Rate Limit Exceeded Response:** `429 Too Many Requests`
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests, please try again later",
    "retry_after": 60
  }
}
```

---

## Code Examples

### Complete File Upload Flow

```javascript
// 1. Encrypt file
async function encryptAndUploadFile(file, token) {
  // Generate AES key
  const aesKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt file
  const fileBuffer = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    fileBuffer
  );
  
  // Extract auth tag
  const encryptedArray = new Uint8Array(encrypted);
  const authTag = encryptedArray.slice(-16);
  const ciphertext = encryptedArray.slice(0, -16);
  
  // Export and wrap key
  const exportedKey = await crypto.subtle.exportKey('raw', aesKey);
  const wrappedKey = await wrapKey(exportedKey, userRSAPublicKey);
  
  // Prepare form data
  const formData = new FormData();
  formData.append('file', new Blob([ciphertext]));
  formData.append('filename', file.name);
  formData.append('file_size', file.size.toString());
  formData.append('file_type', file.type);
  formData.append('wrapped_key', arrayBufferToBase64(wrappedKey));
  formData.append('encryption_iv', arrayBufferToBase64(iv));
  formData.append('auth_tag', arrayBufferToBase64(authTag));
  
  // Upload
  const response = await fetch('http://localhost:5000/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
}
```

### Complete File Download Flow

```javascript
async function downloadAndDecryptFile(fileId, token, rsaPrivateKey) {
  // 1. Get file metadata
  const metaResponse = await fetch(`http://localhost:5000/files/${fileId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const metadata = await metaResponse.json();
  
  // 2. Download encrypted file
  const fileResponse = await fetch(
    `http://localhost:5000/files/${fileId}/download`,
    { headers: { 'Authorization': `Bearer ${token}` } }
  );
  const encryptedData = await fileResponse.arrayBuffer();
  
  // 3. Unwrap AES key
  const wrappedKeyBuffer = base64ToArrayBuffer(metadata.wrapped_key);
  const unwrappedKey = await crypto.subtle.decrypt(
    { name: 'RSA-OAEP' },
    rsaPrivateKey,
    wrappedKeyBuffer
  );
  
  // 4. Import AES key
  const aesKey = await crypto.subtle.importKey(
    'raw',
    unwrappedKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // 5. Reconstruct encrypted data with auth tag
  const iv = base64ToArrayBuffer(metadata.encryption_iv);
  const authTag = base64ToArrayBuffer(metadata.auth_tag);
  const encryptedArray = new Uint8Array(encryptedData);
  const dataWithTag = new Uint8Array([
    ...encryptedArray,
    ...new Uint8Array(authTag)
  ]);
  
  // 6. Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    dataWithTag
  );
  
  // 7. Create download
  const blob = new Blob([decrypted], { type: metadata.file_type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = metadata.filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### Authentication Flow

```javascript
class CryptoVaultAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }
  
  async register(username, email, password) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  }
  
  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    const data = await response.json();
    this.token = data.access_token;
    localStorage.setItem('token', this.token);
    
    return data;
  }
  
  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }
  
  async request(endpoint, options = {}) {
    const headers = new Headers(options.headers || {});
    
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      this.logout();
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return await response.json();
  }
}
```

---

## Postman Collection

A Postman collection is available for testing all API endpoints:

**Import URL:** `docs/postman/CryptoVault_API.postman_collection.json`

**Environment Variables:**
```json
{
  "base_url": "http://localhost:5000",
  "token": "{{access_token}}"
}
```

---

## Changelog

### Version 1.0 (2025-10-12)
- Initial API release
- Authentication endpoints
- File upload/download
- File sharing (in progress)
- Health check endpoint

---

**API Version:** 1.0  
**Last Updated:** October 12, 2025  
**Maintained By:** CyberSec-Sagar-Security
