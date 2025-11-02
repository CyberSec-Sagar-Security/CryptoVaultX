# CryptoVault - Technology Stack

## Quick Reference

### Backend Technology
**Python Flask 3.x**
- REST API framework
- Lightweight and flexible
- Built-in development server
- Easy integration with PostgreSQL

### Database System
**PostgreSQL**
- Relational database
- BYTEA columns for encrypted file storage
- Connection pooling with psycopg2
- ACID compliance for data integrity

### Frontend Framework
**React 18 + TypeScript**
- Component-based architecture
- Type safety with TypeScript
- Build tool: Vite 6.3.5
- Styling: Tailwind CSS
- Routing: React Router v6

### Encryption Libraries

**Backend (Python):**
- `cryptography` library
  - Fernet (symmetric encryption)
  - AES-256-GCM support
  - HMAC authentication

**Frontend (JavaScript):**
- **Web Crypto API** (native browser API)
  - AES-256-GCM encryption
  - SubtleCrypto for key generation
  - Client-side encryption before upload
  - Zero-knowledge architecture

### Additional Technologies

**Authentication:**
- Flask-JWT-Extended
- JWT tokens (15-minute expiry)
- Refresh token mechanism

**Real-time Features:**
- Flask-SocketIO
- WebSocket connections
- Real-time progress tracking

**Background Jobs:**
- APScheduler
- Data cleanup jobs
- Analytics calculation

**Development Tools:**
- Git version control
- PowerShell scripts
- Python virtual environments
- npm package manager

---

## Architecture Summary

```
Frontend (React + TypeScript)
    ↓ HTTPS
    ↓ Web Crypto API (AES-256-GCM)
    ↓
Backend (Flask + Python)
    ↓ psycopg2
    ↓ Fernet encryption
    ↓
Database (PostgreSQL)
    ↓ BYTEA storage
    ↓
Filesystem (Local storage)
```

---

**Last Updated:** November 2, 2025
