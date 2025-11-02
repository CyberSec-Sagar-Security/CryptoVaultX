# CryptoVault - Project Structure Documentation

**Last Updated:** October 31, 2025  
**Version:** 2.0 (Post-Cleanup)

---

## 📁 Root Directory Structure

```
CryptoVault/
├── core/                      # Application source code
├── docs/                      # Documentation
├── operations/                # Infrastructure & deployment
├── scripts/                   # Development & utility scripts
├── storage/                   # Runtime user file storage
├── start_backend.bat          # Quick start script (Windows)
├── .gitignore                 # Git ignore configuration
└── README.md                  # Project readme
```

---

## 🎯 Core Application

### Backend (`core/backend/`)

Flask-based Python backend with PostgreSQL database.

```
backend/
├── routes/                    # API endpoint handlers
│   ├── auth.py               # Authentication endpoints
│   ├── files.py              # File management API
│   ├── shares.py             # File sharing API
│   ├── sync.py               # Sync events API
│   ├── users.py              # User profile API
│   ├── health.py             # Health check endpoints
│   ├── uploadController.py   # Upload handling
│   ├── downloadController.py # Download handling
│   ├── deleteController.py   # Delete operations
│   └── bulkController.py     # Bulk operations
│
├── middleware/                # Request middleware
│   ├── auth.py               # JWT authentication
│   ├── access_control.py     # File access control
│   └── quota.py              # Storage quota enforcement
│
├── migrations/                # Database schema migrations
│   └── *.sql                 # Migration scripts
│
├── jobs/                      # Background jobs
│   └── data_cleaner.py       # Cleanup orphaned files
│
├── utils/                     # Utility modules
│   └── sync_events.py        # Real-time sync utilities
│
├── storage/                   # User file storage (local)
│   └── <user_id>/            # Per-user directories
│
├── uploads/                   # Temporary upload staging
│
├── app.py                     # Flask application factory
├── database.py                # PostgreSQL connection pool
├── models.py                  # Data models & schemas
├── config.py                  # Environment configuration
├── storage_manager.py         # File storage management
└── requirements.txt           # Python dependencies
```

**Key Technologies:**
- Flask 3.x
- Flask-JWT-Extended (Authentication)
- Flask-SocketIO (Real-time updates)
- PostgreSQL with psycopg2
- Cryptography library

---

### Frontend (`core/frontend/`)

React + TypeScript frontend with Vite build tool.

```
frontend/
├── src/
│   ├── pages/                # Page components
│   │   ├── auth/            # Login, Register, ForgotPassword
│   │   ├── dashboard/       # Main dashboard
│   │   ├── profile/         # User profile pages
│   │   ├── help/            # Help & FAQ pages
│   │   ├── shared/          # Shared files view
│   │   ├── settings/        # Settings pages
│   │   ├── legal/           # Terms & Privacy pages
│   │   └── error/           # Error pages (404, etc.)
│   │
│   ├── components/           # Reusable components
│   │   ├── layout/          # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Navbar.tsx
│   │   └── ui/              # UI primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       └── ... (more UI components)
│   │
│   ├── router/               # Routing configuration
│   │   └── AppRouter.tsx    # React Router setup
│   │
│   ├── services/             # External services
│   │   ├── api.ts           # API client (axios)
│   │   └── auth.tsx         # Authentication context
│   │
│   ├── lib/                  # Utilities & helpers
│   │   ├── crypto.ts        # Encryption utilities
│   │   └── utils.ts         # General utilities
│   │
│   ├── App.tsx               # Root component
│   └── main.tsx              # Application entry point
│
├── public/                    # Static assets
│   ├── vite.svg
│   └── ... (other assets)
│
├── package.json               # Dependencies & scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

**Key Technologies:**
- React 18
- TypeScript
- React Router v6
- Vite (Build tool)
- Tailwind CSS
- Framer Motion (Animations)
- Axios (HTTP client)
- Lucide React (Icons)

---

## 📚 Documentation (`docs/`)

Comprehensive project documentation.

```
docs/
├── guides/                    # Technical guides
│   ├── API_DOCUMENTATION.md  # Complete API reference
│   └── TECHNICAL_SPECIFICATION.md # Technical specs
│
├── PROJECT_OVERVIEW.md        # Architecture overview
├── SETUP_GUIDE.md             # Installation & setup guide
├── SHARING_SYNC_API.md        # File sharing API details
└── README.md                  # Documentation index
```

---

## 🔧 Operations (`operations/`)

Infrastructure and deployment configurations.

```
operations/
├── database/                  # Database scripts
│   └── init-db.sql           # Initial schema setup
│
├── docker/                    # Docker configurations
│   └── docker-compose.yml    # Docker Compose setup
│
└── scripts/                   # Deployment scripts
    ├── run-migration.ps1     # Database migration runner
    ├── start-all-services.ps1
    └── ... (other scripts)
```

---

## 🛠️ Scripts (`scripts/`)

Development and utility scripts (all PowerShell).

```
scripts/
├── start.ps1                  # Start all services
├── start_backend.ps1          # Start Flask backend only
├── start_frontend.ps1         # Start React dev server only
├── start_postgresql.ps1       # Start PostgreSQL only
├── start_development.ps1      # Full development environment
└── cleanup_project.ps1        # Project cleanup utility
```

**Usage:**
```powershell
# Start everything
.\scripts\start_development.ps1

# Start individually
.\scripts\start_postgresql.ps1
.\scripts\start_backend.ps1
.\scripts\start_frontend.ps1

# Or use the batch file for backend
.\start_backend.bat
```

---

## 💾 Storage (`storage/`)

Runtime storage directory created automatically when application runs.

```
storage/
└── <user_id>/                 # Per-user directory
    ├── uploads/               # Active user files
    └── deleted/               # Soft-deleted files
```

**Note:** This directory is excluded from git (see `.gitignore`).

---

## 🚀 Application Flow

### 1. Authentication Flow
```
User Login → JWT Token → Stored in localStorage → Included in API requests
```

### 2. File Upload Flow
```
User selects file → 
Client-side encryption (AES-256-GCM) → 
Upload to backend → 
Store in PostgreSQL → 
Update user quota
```

### 3. File Download Flow
```
Request file → 
Check permissions → 
Retrieve from database → 
Send to client → 
Client-side decryption
```

### 4. File Sharing Flow
```
Owner shares file → 
Create share record → 
Generate share link → 
Recipient accesses → 
Permission validation → 
File access granted
```

---

## 🔐 Security Features

1. **Client-Side Encryption:** Files encrypted in browser before upload
2. **JWT Authentication:** Secure token-based auth with 15-min expiry
3. **Access Control:** Middleware validates file ownership
4. **Storage Quotas:** Per-user limits enforced
5. **Password Hashing:** bcrypt with salt
6. **CORS Protection:** Configured for specific origins

---

## 🗄️ Database Schema

**Main Tables:**
- `users` - User accounts
- `files` - File metadata & encrypted content
- `shares` - File sharing permissions
- `sync_events` - Real-time sync tracking
- `storage_quotas` - User storage limits

See `operations/database/init-db.sql` for complete schema.

---

## 📦 Dependencies

### Backend Requirements
- Flask 3.0+
- Flask-JWT-Extended
- Flask-SocketIO
- psycopg2-binary
- cryptography
- python-dotenv
- bcrypt

### Frontend Dependencies
- React 18
- React Router DOM 6
- TypeScript 5+
- Vite 5
- Tailwind CSS 3
- Axios
- Framer Motion
- Lucide React

---

## 🧪 Development Workflow

1. **Start PostgreSQL** (must be running)
   ```powershell
   .\scripts\start_postgresql.ps1
   ```

2. **Start Backend** (Flask development server)
   ```powershell
   .\start_backend.bat
   ```

3. **Start Frontend** (Vite dev server with HMR)
   ```powershell
   .\scripts\start_frontend.ps1
   ```

4. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Docs: http://localhost:5000/api

---

## 📝 Notes

- All sensitive configuration is in `.env` files (not committed)
- User file storage is local filesystem (can be migrated to S3/Azure)
- Database migrations are manual (see `core/backend/migrations/`)
- Real-time features use SocketIO (WebSocket fallback)

---

## 🔄 Recent Changes (v2.0)

**Cleanup Summary:**
- ✅ Removed unused page folders (`Dropdown_Sidebar`)
- ✅ Consolidated documentation (removed duplicates)
- ✅ Organized scripts into `/scripts` folder
- ✅ Removed test files and temporary scripts
- ✅ Updated README with new structure
- ✅ Kept essential startup scripts and documentation

**Preserved Features:**
- All active pages (dashboard, profile, help, shared, settings, legal)
- All API endpoints and middleware
- Complete authentication system
- File encryption and sharing functionality
- Real-time sync capabilities

---

**For detailed API documentation, see:** `docs/guides/API_DOCUMENTATION.md`  
**For setup instructions, see:** `docs/SETUP_GUIDE.md`  
**For architecture details, see:** `docs/PROJECT_OVERVIEW.md`
