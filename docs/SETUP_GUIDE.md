# 🚀 CryptoVaultX - Secure Sharing & Real-time Sync Setup Guide

This guide will help you set up the new secure file sharing and real-time synchronization features.

---

## 📋 Prerequisites

- Python 3.8+
- PostgreSQL 12+
- Node.js 16+ (for frontend)
- Existing CryptoVaultX installation

---

## 🔧 Backend Setup

### Step 1: Install Python Dependencies

```powershell
cd core\backend
pip install -r requirements.txt
```

**New packages installed:**
- `Flask-SocketIO==5.3.6` - WebSocket support
- `python-socketio==5.11.0` - Socket.IO server
- `redis==5.0.1` - Optional: for Redis pub/sub (production scaling)
- `APScheduler==3.10.4` - Background job scheduler

### Step 2: Run Database Migrations

The shares table should already exist from previous migration. Run the sync_events migration:

```powershell
# Connect to PostgreSQL
$env:PGPASSWORD="sql123"
psql -U cryptovault_user -d cryptovault_db -h localhost -p 5432

# Inside psql:
\i core/backend/migrations/20251028_create_sync_events_table.sql
```

Or run directly:

```powershell
$env:PGPASSWORD="sql123"
Get-Content core\backend\migrations\20251028_create_sync_events_table.sql | psql -U cryptovault_user -d cryptovault_db -h localhost -p 5432
```

### Step 3: Verify Database Tables

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('shares', 'sync_events');

-- Should return:
-- shares
-- sync_events
```

### Step 4: Start Backend Server

```powershell
cd core\backend
python app.py
```

**Expected output:**
```
✓ Database connection successful
✓ Database tables ready
Data cleaner scheduler started
All data cleaner jobs scheduled
SocketIO server initialized
 * Running on http://0.0.0.0:5000
```

---

## 🎨 Frontend Setup

### Step 1: Install NPM Dependencies

```powershell
cd core\frontend
npm install socket.io-client
```

### Step 2: Verify Socket Manager

Check that `src/services/socketManager.ts` exists:

```powershell
Test-Path src\services\socketManager.ts
# Should return: True
```

### Step 3: Start Frontend

```powershell
npm run dev
```

---

## ✅ Verification & Testing

### Test 1: Backend Health Check

```powershell
# Test basic API
curl http://localhost:5000/api

# Expected: {"status":"ok","message":"CryptoVault API is running"}
```

### Test 2: Authentication

```powershell
# Login to get token
$body = @{
    email = "your-email@example.com"
    password = "your-password"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.access_token

Write-Host "Token: $token"
```

### Test 3: User Search

```powershell
# Search for users (requires authentication)
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/users/search?q=test" -Headers $headers
```

### Test 4: File Sharing

```powershell
# Share a file with a user
$body = @{
    usernames = @("testuser2")
    permission = "read"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/files/YOUR_FILE_ID/share" -Method POST -Headers $headers -Body $body -ContentType "application/json"
```

### Test 5: List Shared Files

```powershell
# Files shared with you
Invoke-RestMethod -Uri "http://localhost:5000/api/shared?view=received" -Headers $headers

# Files you shared
Invoke-RestMethod -Uri "http://localhost:5000/api/shared?view=sent" -Headers $headers
```

### Test 6: Sync Updates

```powershell
# Get sync events since a timestamp
$since = (Get-Date).AddMinutes(-30).ToString("yyyy-MM-ddTHH:mm:ssZ")
Invoke-RestMethod -Uri "http://localhost:5000/api/sync/updates?since=$since" -Headers $headers
```

### Test 7: WebSocket Connection (Browser Console)

Open browser console and run:

```javascript
// Import socket manager (if not already in your component)
import socketManager from '@/services/socketManager';

// Connect with your JWT token
const token = localStorage.getItem('token');
socketManager.connect(token);

// Subscribe to events
socketManager.on('any', (event) => {
  console.log('Sync event received:', event);
});

// Check connection
console.log('Connected:', socketManager.isConnected());

// Upload a file in another tab → Should see event logged
```

---

## 🔍 Troubleshooting

### Issue: Database connection failed

**Solution:**
```powershell
# Check PostgreSQL is running
Get-Service postgresql*

# Test connection manually
psql -U cryptovault_user -d cryptovault_db -h localhost
```

### Issue: Table 'shares' does not exist

**Solution:**
```powershell
# Run shares table migration
$env:PGPASSWORD="sql123"
Get-Content core\backend\migrations\20251027_create_shares_table.sql | psql -U cryptovault_user -d cryptovault_db
```

### Issue: WebSocket connection fails

**Solution 1 - Check CORS:**
- Verify `Flask-SocketIO` is installed
- Check `cors_allowed_origins="*"` in `app.py`

**Solution 2 - Fallback to polling:**
- The socket manager automatically falls back to HTTP polling
- Check browser console for errors
- Verify `/api/sync/updates` endpoint is accessible

### Issue: Sync events not received

**Solution:**
```powershell
# Check sync_events table
psql -U cryptovault_user -d cryptovault_db -c "SELECT * FROM sync_events ORDER BY created_at DESC LIMIT 5;"

# If empty, try creating an event manually by uploading a file
```

### Issue: Import errors

**Solution:**
```powershell
cd core\backend
pip install --upgrade -r requirements.txt
```

---

## 🧪 Manual Testing Checklist

- [ ] Backend starts without errors
- [ ] PostgreSQL connection successful
- [ ] `shares` table exists and accessible
- [ ] `sync_events` table exists and accessible
- [ ] User authentication works (`/api/auth/login`)
- [ ] User search returns results (`/api/users/search?q=test`)
- [ ] File sharing succeeds (`POST /api/files/:id/share`)
- [ ] Shared files list works (`/api/shared`)
- [ ] Share revocation works (`DELETE /api/files/:id/share/:userId`)
- [ ] Sync polling works (`/api/sync/updates`)
- [ ] WebSocket connects successfully (browser console)
- [ ] Sync events received in real-time
- [ ] Background jobs run without errors (check logs)
- [ ] Frontend socket manager initializes

---

## 📊 Database Schema Verification

```sql
-- Verify shares table structure
\d shares

-- Expected columns:
-- id, file_id, grantee_user_id, permission, created_at

-- Verify sync_events table structure
\d sync_events

-- Expected columns:
-- id, user_id, event_type, payload, created_at

-- Check indexes
\di

-- Expected indexes:
-- idx_shares_file_id
-- idx_shares_grantee_user_id
-- idx_sync_events_user_id
-- idx_sync_events_created_at
```

---

## 🔐 Security Verification

### Check Access Control

```powershell
# Try to download a file you don't own (should fail with 403)
$headers = @{
    "Authorization" = "Bearer $token"
}

# This should fail if the file belongs to another user
Invoke-RestMethod -Uri "http://localhost:5000/api/files/SOMEONE_ELSES_FILE_ID/download" -Headers $headers
# Expected: 403 Forbidden
```

### Check Share Permissions

```sql
-- Verify unique constraint on shares
INSERT INTO shares (file_id, grantee_user_id, permission) 
VALUES ('test-file-id', 1, 'read');

-- Try duplicate (should fail)
INSERT INTO shares (file_id, grantee_user_id, permission) 
VALUES ('test-file-id', 1, 'read');
-- Expected: ERROR: duplicate key value violates unique constraint
```

---

## 📈 Performance Testing

### Test WebSocket Throughput

```javascript
// In browser console
let eventCount = 0;
socketManager.on('any', () => eventCount++);

// Upload 10 files rapidly
// Check eventCount after 10 seconds
console.log('Events received:', eventCount);
// Should be at least 10 (one per upload)
```

### Test Polling Performance

```powershell
# Measure response time
Measure-Command {
    Invoke-RestMethod -Uri "http://localhost:5000/api/sync/updates?since=2025-01-01T00:00:00Z" -Headers $headers
}
# Should be < 500ms for reasonable dataset
```

---

## 🎯 Next Steps

After successful setup:

1. **Build UI Components** (see `docs/IMPLEMENTATION_SUMMARY.md`)
   - ShareFileModal.tsx
   - SharedFilesSection.tsx
   - Integrate into FilesPage.tsx

2. **Add Notifications**
   - Toast system for sync events
   - "File shared with you" alerts

3. **Optimize Performance**
   - Add Redis for production WebSocket scaling
   - Implement event batching for high-volume scenarios

4. **Production Deployment**
   - Configure Redis message queue
   - Set up monitoring for background jobs
   - Add rate limiting for sharing endpoints

---

## 📞 Support & Resources

**Documentation:**
- `/docs/IMPLEMENTATION_SUMMARY.md` - Complete feature overview
- `/docs/SHARING_SYNC_API.md` - API reference with examples
- `/docs/guides/API_DOCUMENTATION.md` - General API docs

**Database Migrations:**
- `/core/backend/migrations/20251027_create_shares_table.sql`
- `/core/backend/migrations/20251028_create_sync_events_table.sql`

**Key Files:**
- Backend: `core/backend/routes/shares.py` - Sharing endpoints
- Backend: `core/backend/routes/sync.py` - Sync endpoints
- Backend: `core/backend/utils/sync_events.py` - Event system
- Frontend: `core/frontend/src/services/socketManager.ts` - WebSocket client

**Logs:**
Check server logs for debugging:
```powershell
python app.py 2>&1 | Tee-Object -FilePath server.log
```

---

## ✅ Setup Complete!

If all tests pass, your CryptoVaultX installation now has:

✅ **Secure File Sharing** - Username-based, multi-user, multi-file  
✅ **Real-time Sync** - WebSocket with polling fallback  
✅ **Access Control** - Enforced owner/grantee permissions  
✅ **Background Jobs** - Auto data cleaning and maintenance  
✅ **Event System** - Complete audit trail  

**Ready for frontend UI integration!** 🎉

---

**Last Updated:** 2025-10-28  
**Version:** 1.0.0
