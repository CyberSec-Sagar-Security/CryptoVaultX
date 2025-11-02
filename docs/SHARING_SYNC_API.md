# CryptoVaultX - Sharing & Sync API Reference

## 🔐 File Sharing Endpoints

### POST /api/files/:id/share
Share one or more files with one or more users.

**Request:**
```json
{
  "usernames": ["alice", "bob"],      // Required: array or string
  "file_ids": ["file1", "file2"],     // Optional: defaults to :id param
  "permission": "read"                 // Optional: read|write|view|download|edit
}
```

**Response (201):**
```json
{
  "message": "Sharing complete: 4 successful, 0 failed",
  "results": {
    "created": [
      {
        "file_id": "abc123",
        "filename": "document.pdf",
        "username": "alice",
        "grantee_user_id": 7,
        "permission": "read"
      }
    ],
    "updated": [],
    "failed": [],
    "skipped": []
  },
  "summary": {
    "created": 4,
    "updated": 0,
    "failed": 0,
    "skipped": 0
  }
}
```

---

### GET /api/shared
List files shared with or by the current user.

**Query Params:**
- `view`: `received` (default) or `sent`
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response (200):**
```json
{
  "view": "received",
  "shared_files": [
    {
      "share_id": 1,
      "file_id": "abc123",
      "filename": "document.pdf",
      "size_bytes": 1024000,
      "content_type": "application/pdf",
      "permission": "read",
      "shared_at": "2025-10-28T15:30:00Z",
      "file_created_at": "2025-10-27T10:00:00Z",
      "shared_by": {
        "user_id": 5,
        "username": "john_doe",
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 45,
    "pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

---

### DELETE /api/files/:id/share/:userId
Revoke file share from a specific user.

**Response (200):**
```json
{
  "message": "File share revoked successfully",
  "file_id": "abc123",
  "grantee_user_id": 7,
  "grantee_username": "alice"
}
```

---

### GET /api/files/:id/shares
List all users who have access to a file (owner only).

**Response (200):**
```json
{
  "file_id": "abc123",
  "filename": "document.pdf",
  "shares": [
    {
      "share_id": 1,
      "user_id": 7,
      "username": "alice",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "permission": "read",
      "shared_at": "2025-10-28T15:30:00Z"
    }
  ],
  "total_shares": 3
}
```

---

### GET /api/shares/stats
Get sharing statistics for the current user.

**Response (200):**
```json
{
  "stats": {
    "files_you_shared": 12,
    "files_shared_with_you": 8,
    "users_who_shared_with_you": 4,
    "users_you_shared_with": 7
  }
}
```

---

### GET /api/users/search
Search for registered users by username.

**Query Params:**
- `q`: Search query (min 2 chars)
- `limit`: Max results (default: 10, max: 50)

**Response (200):**
```json
{
  "query": "ali",
  "users": [
    {
      "id": 7,
      "username": "alice",
      "name": "Alice Smith",
      "email": "alice@example.com"
    }
  ],
  "count": 1
}
```

---

## 🔄 Real-time Sync Endpoints

### GET /api/sync/updates
Get sync events since a timestamp (polling fallback).

**Query Params:**
- `since`: ISO timestamp (required)

**Response (200):**
```json
{
  "events": [
    {
      "event_id": "uuid-here",
      "type": "file_uploaded",
      "user_id": 5,
      "timestamp": "2025-10-28T15:35:00Z",
      "payload": {
        "file_id": "abc123",
        "filename": "report.pdf",
        "size_bytes": 512000,
        "content_type": "application/pdf"
      }
    }
  ],
  "count": 5,
  "since": "2025-10-28T15:00:00Z",
  "server_time": "2025-10-28T15:40:00Z"
}
```

---

### GET /api/sync/status
Check sync system status.

**Response (200):**
```json
{
  "status": "active",
  "server_time": "2025-10-28T15:40:00Z",
  "user_id": 5
}
```

---

## 🔌 WebSocket Events

### Connection
```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' },
  transports: ['websocket', 'polling']
});
```

### Server → Client Events

#### sync_event
Emitted when any file operation occurs.

**Payload:**
```typescript
{
  event_id: string;
  type: 'file_uploaded' | 'file_deleted' | 'file_shared' | 'file_unshared' | 'file_downloaded';
  user_id: number;
  timestamp: string; // ISO format
  payload: {
    file_id?: string;
    filename?: string;
    size_bytes?: number;
    shared_with_user_ids?: number[];
    // ... event-specific fields
  };
}
```

**Example:**
```typescript
socket.on('sync_event', (event) => {
  console.log('Sync event:', event);
  
  switch (event.type) {
    case 'file_uploaded':
      // Refresh file list
      break;
    case 'file_shared':
      // Show notification
      break;
    // ... handle other events
  }
});
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required field",
  "details": "..."
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please provide a valid JWT token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You do not have permission to access this file"
}
```

### 404 Not Found
```json
{
  "error": "File not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "File sharing failed",
  "details": "..."
}
```

---

## 📋 Event Types Reference

| Event Type | Trigger | Payload Fields |
|------------|---------|----------------|
| `file_uploaded` | File uploaded successfully | `file_id`, `filename`, `size_bytes`, `content_type` |
| `file_deleted` | File deleted by owner | `file_id`, `filename` |
| `file_shared` | File shared with user(s) | `file_ids`, `shared_with_user_ids`, `permission` |
| `file_unshared` | Share revoked | `file_id`, `filename`, `grantee_user_id` |
| `file_downloaded` | File accessed | `file_id`, `filename`, `size_bytes` |
| `metadata_updated` | File metadata changed | `file_id`, `changes` |
| `analytics_updated` | Storage stats recalculated | `total_files`, `total_size` |

---

## 🔐 Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <your-jwt-token>
```

Get token from `/api/auth/login` endpoint.

---

## 📊 Rate Limits

- File sharing: 100 requests/hour per user
- User search: 50 requests/minute per user
- Sync polling: Recommended 30s interval

---

## 🧪 Testing Examples

### Share file with multiple users
```bash
curl -X POST http://localhost:5000/api/files/abc123/share \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "usernames": ["alice", "bob", "charlie"],
    "permission": "read"
  }'
```

### List files shared with me
```bash
curl "http://localhost:5000/api/shared?view=received&page=1&per_page=20" \
  -H "Authorization: Bearer eyJ..."
```

### Search users
```bash
curl "http://localhost:5000/api/users/search?q=alice&limit=10" \
  -H "Authorization: Bearer eyJ..."
```

### Get sync updates
```bash
curl "http://localhost:5000/api/sync/updates?since=2025-10-28T00:00:00Z" \
  -H "Authorization: Bearer eyJ..."
```

### Revoke share
```bash
curl -X DELETE http://localhost:5000/api/files/abc123/share/7 \
  -H "Authorization: Bearer eyJ..."
```

---

## 💡 Best Practices

1. **Deduplication**: Check `event_id` to avoid processing duplicate events
2. **Reconnection**: Always implement WebSocket reconnection logic
3. **Fallback**: Use HTTP polling if WebSocket fails
4. **Timestamps**: Store `lastSyncTimestamp` in localStorage
5. **Batch Operations**: Use multi-file/multi-user sharing for efficiency
6. **Error Handling**: Always check response status and handle errors
7. **Optimistic UI**: Update UI immediately, then sync with server

---

## 📦 Integration Checklist

- [ ] Install dependencies (`Flask-SocketIO`, `socket.io-client`)
- [ ] Run database migrations
- [ ] Update frontend to use `socketManager`
- [ ] Create Share File modal component
- [ ] Add Shared Files section to dashboard
- [ ] Subscribe to sync events in dashboard
- [ ] Implement optimistic UI updates
- [ ] Add toast notifications for events
- [ ] Test WebSocket connection
- [ ] Test polling fallback
- [ ] Verify access control enforcement
- [ ] Test multi-user sharing
- [ ] Monitor background jobs (data cleaner)

---

**API Documentation Complete! 🎉**

For more details, see `IMPLEMENTATION_SUMMARY.md`.
