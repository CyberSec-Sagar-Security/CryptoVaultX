# PostgreSQL BYTEA Storage Implementation - Complete Guide

## Overview

This implementation adds encrypted file persistence directly into PostgreSQL using BYTEA columns with per-user quota enforcement (600 MB). The server **never receives plaintext** - all encryption happens on the client side.

## Key Features

✅ **Client-Side Encryption**: Files encrypted in browser before upload  
✅ **PostgreSQL BYTEA Storage**: Encrypted files stored directly in database  
✅ **600MB Per-User Quota**: Enforced before upload acceptance  
✅ **HTTP 413 Responses**: Proper error codes for quota/size limits  
✅ **No Plaintext Logging**: Only safe metadata is logged  
✅ **SQL Injection Protection**: Parameterized queries throughout  

## Database Schema

### Files Table Structure
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id INTEGER NOT NULL,
    original_filename TEXT NOT NULL,
    content_type TEXT,
    size_bytes BIGINT NOT NULL,
    algo TEXT NOT NULL DEFAULT 'AES-256-GCM',
    iv TEXT NOT NULL,                    -- Base64 encoded IV
    storage_blob BYTEA NOT NULL,         -- Encrypted file content
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Indexes
- `idx_files_owner` on `owner_id` for quota queries
- `idx_files_created_at` on `created_at DESC` for file listing

### Helper Functions
- `get_user_storage_usage(user_id)` - Returns total usage in bytes
- `check_quota_before_upload(user_id, new_size, quota_limit)` - Quota validation

## API Endpoints

### POST `/api/files/`
**Upload encrypted file with quota enforcement**

**Request Format:**
```
Content-Type: multipart/form-data

Fields:
- file: (binary) encrypted file content (ciphertext)
- metadata: (JSON string) {
    "originalFilename": "document.pdf",
    "ivBase64": "base64-encoded-iv",
    "algo": "AES-256-GCM"
  }
```

**Response - Success (201):**
```json
{
  "message": "File uploaded successfully",
  "id": "uuid-file-id",
  "original_filename": "document.pdf",
  "size_bytes": 1048576,
  "created_at": "2025-10-26T12:00:00Z"
}
```

**Response - Quota Exceeded (413):**
```json
{
  "error": "quota_exceeded",
  "message": "User storage quota (600MB) exceeded. Current usage: 450MB"
}
```

### GET `/api/files/{file_id}`
**Download encrypted file**

**Response Headers:**
```
Content-Type: application/octet-stream
X-File-Name: document.pdf
X-File-IV: base64-encoded-iv
X-File-Algo: AES-256-GCM
X-File-Size: 1048576
```

**Response Body:** Raw ciphertext bytes (client decrypts)

### GET `/api/files/list`
**List user files with storage info**

**Response:**
```json
{
  "files": [
    {
      "id": "uuid",
      "original_filename": "document.pdf",
      "size_bytes": 1048576,
      "algo": "AES-256-GCM",
      "content_type": "application/pdf",
      "created_at": "2025-10-26T12:00:00Z"
    }
  ],
  "storage_info": {
    "used_bytes": 10485760,
    "used_mb": 10,
    "quota_bytes": 629145600,
    "quota_mb": 600,
    "remaining_bytes": 618659840,
    "remaining_mb": 590
  }
}
```

### GET `/api/files/quota`
**Check current quota usage**

### DELETE `/api/files/{file_id}`
**Delete file from storage**

## Security Implementation

### Client-Side Encryption Flow
1. **Browser generates session key** using WebCrypto API
2. **File encrypted** with AES-256-GCM before upload
3. **Metadata sent separately** (IV, algorithm, filename)
4. **Server stores ciphertext** in BYTEA column
5. **Client decrypts** on download using session key

### Server Security Measures
- **No plaintext handling**: Server only processes ciphertext
- **Safe logging**: Only metadata logged (file ID, size, IV prefix)
- **Input validation**: Base64 IV validation, filename sanitization
- **SQL injection protection**: Parameterized queries
- **Authorization checks**: User ownership verification

## Quota Enforcement

### Implementation Details
- **Pre-upload check**: Quota verified before accepting file
- **Atomic operations**: Upload+quota check in single transaction
- **Real-time calculation**: Usage calculated from BYTEA column sizes
- **Proper error codes**: HTTP 413 for quota exceeded

### Quota Limits
- **Per-user limit**: 600 MB (629,145,600 bytes)
- **Per-file limit**: 100 MB (104,857,600 bytes)
- **Calculation**: Based on encrypted file size (BYTEA storage)

## Setup Instructions

### 1. Run Database Migration
```powershell
# From project root
.\operations\scripts\run-migration.ps1
```

**Or manually:**
```bash
psql -U postgres -d cryptovault_db -f core/backend/migrations/20251026_create_files_table.sql
```

### 2. Start Backend (Window A)
```powershell
cd core\backend
python app.py
```

### 3. Start Frontend (Window B) 
```powershell
cd core\frontend
npm run dev
```

### 4. Run Tests (Window C)
```powershell
# Basic functionality test
.\testing\test_postgresql_storage.ps1

# Quota enforcement test
.\testing\test_quota_enforcement.ps1
```

## Testing & Validation

### Test Scripts Provided
1. **`test_postgresql_storage.ps1`** - Complete functionality test
2. **`test_quota_enforcement.ps1`** - Quota limit validation
3. **`run-migration.ps1`** - Database setup automation

### Manual Testing
```powershell
# Check database after migration
psql -U postgres -d cryptovault_db -c "\d files"

# Verify quota functions
psql -U postgres -d cryptovault_db -c "SELECT get_user_storage_usage(1);"

# Test quota limit function
psql -U postgres -d cryptovault_db -c "SELECT check_quota_before_upload(1, 1000000, 629145600);"
```

## Frontend Integration Notes

### Upload Implementation
```javascript
// Client-side encryption before upload
const encryptFile = async (file, sessionKey) => {
  const fileBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    sessionKey,
    fileBuffer
  );
  
  return {
    ciphertext,
    iv: btoa(String.fromCharCode(...iv)),
    filename: file.name
  };
};

// Upload to server
const uploadFile = async (encryptedData) => {
  const formData = new FormData();
  formData.append('file', new Blob([encryptedData.ciphertext]));
  formData.append('metadata', JSON.stringify({
    originalFilename: encryptedData.filename,
    ivBase64: encryptedData.iv,
    algo: 'AES-256-GCM'
  }));
  
  return fetch('/api/files/', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
};
```

### Download Implementation
```javascript
// Download and decrypt
const downloadFile = async (fileId, sessionKey) => {
  const response = await fetch(`/api/files/${fileId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const filename = response.headers.get('X-File-Name');
  const ivBase64 = response.headers.get('X-File-IV');
  const ciphertext = await response.arrayBuffer();
  
  // Decrypt
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    sessionKey,
    ciphertext
  );
  
  // Save file
  const blob = new Blob([plaintext]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
};
```

## Monitoring & Maintenance

### Database Monitoring
```sql
-- Check storage usage by user
SELECT owner_id, 
       COUNT(*) as file_count,
       SUM(size_bytes) as total_bytes,
       ROUND(SUM(size_bytes) / 1024.0 / 1024.0, 2) as total_mb
FROM files 
GROUP BY owner_id 
ORDER BY total_bytes DESC;

-- Check largest files
SELECT id, original_filename, size_bytes, 
       ROUND(size_bytes / 1024.0 / 1024.0, 2) as size_mb,
       created_at
FROM files 
ORDER BY size_bytes DESC 
LIMIT 10;

-- Check quota usage
SELECT owner_id,
       get_user_storage_usage(owner_id) as used_bytes,
       ROUND(get_user_storage_usage(owner_id) / 1024.0 / 1024.0, 2) as used_mb,
       CASE 
         WHEN get_user_storage_usage(owner_id) > 600 * 1024 * 1024 
         THEN 'OVER QUOTA' 
         ELSE 'OK' 
       END as status
FROM (SELECT DISTINCT owner_id FROM files) u;
```

### Performance Considerations
- **BYTEA Storage**: Efficient for files up to 1GB
- **Index Usage**: Owner ID index speeds up quota calculations
- **Connection Pooling**: Important for concurrent file operations
- **Backup Strategy**: Include BYTEA columns in backups

## Troubleshooting

### Common Issues

1. **Migration Failed**
   ```bash
   # Check if database exists
   psql -U postgres -l | grep cryptovault_db
   
   # Check user permissions
   psql -U postgres -d cryptovault_db -c "SELECT current_user, current_database();"
   ```

2. **Quota Not Enforced**
   ```python
   # Check function in database
   result = db.session.execute(text("SELECT get_user_storage_usage(1)"))
   print(f"User 1 usage: {result.scalar()} bytes")
   ```

3. **File Upload Fails**
   ```bash
   # Check file size limits
   # Backend logs will show specific error
   tail -f backend.log | grep "Upload error"
   ```

4. **Download Issues**
   ```bash
   # Verify BYTEA data exists
   psql -U postgres -d cryptovault_db -c "SELECT id, original_filename, length(storage_blob) FROM files LIMIT 5;"
   ```

## Production Considerations

### Deployment
- Set `DATABASE_URL` environment variable
- Use connection pooling (SQLAlchemy pool settings)
- Configure PostgreSQL for BYTEA performance
- Set up automated backups including BYTEA data

### Security
- Use TLS for all connections
- Implement rate limiting on upload endpoints
- Monitor for unusual storage patterns
- Regular security audits of encryption implementation

### Scaling
- Consider read replicas for file downloads
- Implement file archiving for old data
- Monitor database size growth
- Plan for quota increases

## Compliance

### Data Protection
- ✅ Client-side encryption (GDPR/HIPAA friendly)
- ✅ No plaintext storage
- ✅ Audit trail in database logs
- ✅ User data isolation (owner_id separation)

### Backup & Recovery
- Include BYTEA columns in backup strategy
- Test restore procedures with encrypted data
- Document encryption key management
- Plan for disaster recovery scenarios