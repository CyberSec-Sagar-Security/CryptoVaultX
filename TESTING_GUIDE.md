# CryptoVault Testing Guide
# Local Storage Per-User Implementation
# Branch: feat/local-storage-per-user

## Prerequisites
- PostgreSQL running on localhost:5432
- Python 3.x with dependencies installed
- Node.js and npm installed
- Backend env configured (.env file)

## Test Setup (3 PowerShell Windows)

### Window A - Backend Server
```powershell
cd "d:\Study and work\College_Software_Projects\CryptoVault\core\backend"
python app.py
```
**Expected:** Flask server starts on http://127.0.0.1:5000
**Watch for:** Database connection success, route registration logs

### Window B - Frontend Dev Server
```powershell
cd "d:\Study and work\College_Software_Projects\CryptoVault\core\frontend"
npm run dev
```
**Expected:** Vite dev server starts (typically on http://localhost:5173)
**Watch for:** Compilation success, no build errors

### Window C - Verification Commands
Use this window for manual verification steps below.

---

## Test Procedure

### 1. User Registration & Folder Creation
**Action:** Register a new user via the UI
- Username: `testuser1`
- Email: `testuser1@cryptovault.test`
- Password: `TestPass123!`

**Verify folders created:**
```powershell
cd "d:\Study and work\College_Software_Projects\CryptoVault\core\backend"
Get-ChildItem -Force .\storage\<user_id>\uploads
Get-ChildItem -Force .\storage\<user_id>\deleted
```
**Expected:** Both directories exist and are empty

**Backend log should show:**
```
✅ Created storage folders for user <user_id>
   📁 Uploads: ...
   🗑️ Deleted: ...
```

---

### 2. Encrypted File Upload
**Action:** Upload a small test file (e.g., 1MB) via the UI
- Select encryption level: HIGH
- Choose a file (create one if needed):
  ```powershell
  "Test content for CryptoVault" | Out-File -FilePath .\test_upload.txt
  ```

**Verify encrypted file stored:**
```powershell
Get-ChildItem -Force .\storage\<user_id>\uploads
```
**Expected:** One `.enc` file with unique UUID name

**Backend log should show:**
```
✅ Encrypted file stored locally: <file_id> (size: X bytes, path: storage/<user_id>/uploads/<uuid>.enc)
```

**Browser DevTools Network Tab:**
- Request: POST http://localhost:5000/api/files
- Status: 201 Created
- Payload should contain:
  - `file`: binary data (encrypted)
  - `metadata`: JSON with `originalFilename`, `ivBase64`, `algo`
- **CRITICAL:** No plaintext or keys in network request!

---

### 3. File Download & Decryption
**Action:** Click download button for the uploaded file

**Browser DevTools Network Tab:**
- Request: GET http://localhost:5000/api/files/<file_id>
- Status: 200 OK
- Response Headers should include:
  - `X-File-Name`: original filename
  - `X-File-IV`: base64 encoded IV
  - `X-File-Algo`: AES-256-GCM
  - `Content-Disposition`: attachment; filename="..."
- Response body: Binary encrypted data

**Verify decryption:**
- File should download automatically
- Open the downloaded file
- Content should match original (not garbled)

**Backend log should show:**
```
✅ File downloaded: <file_id> (size: X bytes)
```

**Optional - Checksum verification:**
```powershell
# Original file
Get-FileHash .\test_upload.txt

# Downloaded file (after decryption)
Get-FileHash ~\Downloads\test_upload.txt
```
**Expected:** Hashes match

---

### 4. File Deletion (Soft Delete)
**Action:** Click delete button for the uploaded file, confirm deletion

**Verify file moved to deleted folder:**
```powershell
# Uploads folder should be empty
Get-ChildItem -Force .\storage\<user_id>\uploads

# Deleted folder should have one file
Get-ChildItem -Force .\storage\<user_id>\deleted
```
**Expected:** File moved from uploads/ to deleted/ with timestamp prefix

**Backend log should show:**
```
✅ File soft deleted: <file_id> → storage/<user_id>/deleted/<timestamp>_<uuid>.enc
```

**Database verification (optional):**
```sql
SELECT id, original_filename, status, deleted_at 
FROM files 
WHERE owner_id = <user_id>;
```
**Expected:** status = 'deleted', deleted_at timestamp set

---

### 5. Quota Enforcement (512MB Limit)
**Test A - Under quota:**
- Upload multiple small files
- Check quota info: GET /api/files/quota
- Response should show remaining space

**Test B - Exceed quota:**
Create a large test file (600MB):
```powershell
# WARNING: Creates 600MB file - ensure adequate disk space
fsutil file createnew .\dummy_600mb.bin 629145600
```

**Action:** Try to upload the 600MB file via UI

**Expected Response:**
- Status: 413 Payload Too Large
- Error message: "User storage quota (512MB) exceeded"
- File should NOT appear in storage folders

**Backend log should show:**
```
❌ Quota check failed for user <user_id>
```

**Clean up:**
```powershell
Remove-Item .\dummy_600mb.bin
```

**Browser DevTools should show:**
- POST http://localhost:5000/api/files
- Status: 413
- Response: `{"error": "quota_exceeded", "message": "..."}`

---

### 6. Storage Info Verification
**Action:** Check storage usage via UI or API

**API Call:**
```powershell
$token = "YOUR_JWT_TOKEN"
Invoke-RestMethod -Uri "http://localhost:5000/api/files/quota" `
  -Headers @{"Authorization" = "Bearer $token"} `
  -Method Get
```

**Expected Response:**
```json
{
  "storage_info": {
    "used_bytes": <number>,
    "used_mb": <number>,
    "quota_bytes": 536870912,
    "quota_mb": 512,
    "remaining_bytes": <number>,
    "remaining_mb": <number>,
    "usage_percentage": <number>,
    "uploads_bytes": <number>,
    "deleted_bytes": <number>
  }
}
```

**Verify:** `uploads_bytes + deleted_bytes = used_bytes`

---

## Security Verification Checklist

### ✅ Client-Side Encryption
- [ ] Files are encrypted in browser using Web Crypto API
- [ ] AES-256-GCM algorithm used
- [ ] Random 12-byte IV generated per file
- [ ] Encryption key stays in browser (sessionStorage)

### ✅ Server Behavior
- [ ] Server receives only ciphertext (no plaintext)
- [ ] Server never receives encryption keys
- [ ] Backend logs show no sensitive data
- [ ] Network requests contain no plaintext or keys

### ✅ Storage Implementation
- [ ] Per-user folders created on registration
- [ ] Encrypted files stored in ./storage/<user_id>/uploads/
- [ ] Deleted files moved to ./storage/<user_id>/deleted/
- [ ] PostgreSQL stores ONLY metadata (no file blobs)

### ✅ Quota Enforcement
- [ ] Total storage (uploads + deleted) <= 512MB
- [ ] Upload blocked with HTTP 413 when quota exceeded
- [ ] No temp files left after failed uploads
- [ ] Quota info accurately reflects disk usage

### ✅ File Operations
- [ ] Upload: multipart/form-data with file + metadata
- [ ] Download: streams ciphertext with metadata headers
- [ ] Delete: soft delete (moves to deleted folder)
- [ ] List: returns metadata only (from database)

---

## Troubleshooting

### Backend won't start
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Test database connection
psql -U postgres -d cryptovault -c "\dt"

# Check Python dependencies
pip install -r requirements.txt
```

### Frontend build errors
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse node_modules
npm install
```

### Upload fails with 401
- Check JWT token in localStorage
- Verify Authorization header in network request
- Re-login if token expired

### Upload fails with TypeError: Failed to fetch
- Verify backend is running on http://localhost:5000
- Check VITE_API_BASE_URL in frontend .env
- Inspect browser console for CORS errors

### Files not appearing
- Check backend logs for errors
- Verify database connection
- Check storage folder permissions
- Use `Get-ChildItem -Force` to see hidden files

---

## Cleanup After Testing

```powershell
# Remove test files
Remove-Item .\test_upload.txt -ErrorAction SilentlyContinue
Remove-Item .\dummy_600mb.bin -ErrorAction SilentlyContinue

# Optional: Remove test user storage (careful!)
# Remove-Item -Recurse .\core\backend\storage\<user_id>
```

---

## Success Criteria

All tests pass when:
1. ✅ User registration creates folders
2. ✅ File upload stores encrypted file on disk + metadata in DB
3. ✅ File download streams ciphertext, client decrypts successfully
4. ✅ File deletion moves file to deleted folder
5. ✅ Quota enforcement blocks uploads > 512MB total
6. ✅ No plaintext or keys visible in logs or network
7. ✅ Storage info accurately reflects disk usage

---

## Next Steps for PR

1. Capture screenshots of:
   - Storage folders (uploads/ and deleted/)
   - Successful upload (network request showing encrypted data only)
   - Successful download (network response headers)
   - Quota rejection (HTTP 413 response)

2. Create PR with verification checklist
3. Include test results in PR description
4. Tag for review

---

**Branch:** feat/local-storage-per-user
**Implementation Date:** 2025-10-26
**Verified By:** [Your Name]
