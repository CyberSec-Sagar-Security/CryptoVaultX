# 🔐 CryptoVault

**Secure End-to-End Encrypted File Storage System**

A modern, full-stack web application providing secure file storage with client-side encryption, built with Flask (Python) backend and React + TypeScript frontend.

---

## 🌟 Features

- **🔒 Client-Side Encryption**: Files encrypted in browser using AES-256-GCM before upload
- **👤 User Authentication**: Secure JWT-based authentication system
- **📦 File Management**: Upload, download, delete encrypted files
- **💾 PostgreSQL Storage**: Encrypted files stored in PostgreSQL BYTEA columns
- **📊 Storage Quota**: 512MB per-user storage limit with real-time tracking
- **⚡ Real-Time Progress**: Live upload/download progress tracking
- **🎨 Modern UI**: Beautiful, responsive React interface with Tailwind CSS

---

## 🏗️ Project Structure

```
CryptoVault/
├── core/
│   ├── backend/              # Flask Python Backend
│   │   ├── routes/           # API endpoints (auth, files, shares, etc.)
│   │   ├── middleware/       # Auth, quota, access control
│   │   ├── migrations/       # Database schema migrations
│   │   ├── jobs/             # Background jobs (data cleaner)
│   │   ├── utils/            # Utility functions
│   │   ├── app.py            # Main Flask application
│   │   ├── database.py       # PostgreSQL connection pool
│   │   ├── models.py         # Data models
│   │   └── config.py         # Environment configuration
│   │
│   └── frontend/             # React + TypeScript Frontend
│       ├── src/
│       │   ├── pages/        # Page components (dashboard, profile, etc.)
│       │   ├── components/   # Reusable UI components
│       │   │   ├── layout/   # Layout components (Sidebar, Navbar)
│       │   │   └── ui/       # UI primitives (Button, Card, etc.)
│       │   ├── router/       # React Router configuration
│       │   ├── services/     # API client & authentication
│       │   └── lib/          # Utilities & helpers
│       ├── public/           # Static assets
│       └── package.json      # Frontend dependencies
│
├── docs/                     # Project Documentation
│   ├── guides/               # Technical guides & API docs
│   │   ├── API_DOCUMENTATION.md
│   │   └── TECHNICAL_SPECIFICATION.md
│   ├── PROJECT_OVERVIEW.md   # High-level architecture
│   ├── SETUP_GUIDE.md        # Setup instructions
│   ├── SHARING_SYNC_API.md   # File sharing API docs
│   └── README.md             # Documentation index
│
├── operations/               # DevOps & Infrastructure
│   ├── database/             # Database initialization scripts
│   ├── docker/               # Docker Compose configurations
│   └── scripts/              # Deployment & management scripts
│
├── scripts/                  # Development Scripts
│   ├── start.ps1             # Start all services
│   ├── start_backend.ps1     # Start Flask backend
│   ├── start_frontend.ps1    # Start React dev server
│   ├── start_postgresql.ps1  # Start PostgreSQL
│   ├── start_development.ps1 # Full dev environment setup
│   └── cleanup_project.ps1   # Project cleanup utility
│
├── storage/                  # User File Storage (runtime)
│   └── <user_id>/            # Per-user storage directories
│
├── start_backend.bat         # Windows quick start (backend)
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **PostgreSQL 12+**
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/CyberSec-Sagar-Security/CryptoVaultX.git
cd CryptoVault
```

### 2. Start PostgreSQL

```powershell
.\scripts\start_postgresql.ps1
```

### 3. Start Backend (Flask)

```powershell
# Quick start with batch file
.\start_backend.bat

# Or use PowerShell script
.\scripts\start_backend.ps1
```

Backend runs on: `http://localhost:5000`

### 4. Start Frontend (React)

```powershell
.\scripts\start_frontend.ps1
```

Frontend runs on: `http://localhost:5173`

### 5. Quick Start (All Services)

```powershell
.\scripts\start_development.ps1
```

Starts PostgreSQL, Backend, and Frontend automatically.

---

## 🔧 Configuration

### Backend (.env)

```env
FLASK_ENV=development
DATABASE_URL=postgresql://postgres:sql123@localhost:5432/cryptovault_db
JWT_SECRET_KEY=your-secret-key-here
SECRET_KEY=your-flask-secret-key
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Files
- `GET /api/files/list` - List user files
- `POST /api/files/` - Upload encrypted file
- `GET /api/files/<id>/download` - Download file
- `DELETE /api/files/<id>` - Delete file
- `GET /api/files/quota` - Get storage quota

### Health
- `GET /api/health` - API health check

---

## 🔐 Security Features

### Encryption
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Management**: Session-based keys stored in localStorage
- **IV Generation**: Random 12-byte IV per file
- **Zero-Knowledge**: Server never sees plaintext data

### Authentication
- **JWT Tokens**: Secure, stateless authentication
- **Password Hashing**: bcrypt with salt
- **Token Expiration**: 15-minute access tokens

### Data Protection
- **CORS**: Configured for cross-origin security
- **HTTPS Ready**: Production deployment ready
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: React auto-escaping

---

## 📦 Tech Stack

### Backend
- **Flask** - Python web framework
- **PostgreSQL** - Relational database
- **psycopg2** - PostgreSQL adapter
- **Flask-JWT-Extended** - JWT authentication
- **bcrypt** - Password hashing
- **Flask-CORS** - CORS handling

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Framer Motion** - Animations
- **Web Crypto API** - Client-side encryption

---

## 🛠️ Development

### Install Backend Dependencies

```bash
cd core/backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Install Frontend Dependencies

```bash
cd core/frontend
npm install
```

### Run Database Migrations

```bash
cd core/backend
python init_db.py
```

---

## 📊 Database Schema

### Users Table
```sql
id, username, email, password_hash, created_at, updated_at
```

### Files Table
```sql
id, owner_id, original_filename, size_bytes, content_type,
algo, iv, storage_blob, created_at, updated_at
```

### Shares Table (Future)
```sql
id, file_id, owner_user_id, grantee_user_id,
encrypted_key_for_grantee, permissions, created_at
```

---

## 🧪 Testing

CryptoVault includes a comprehensive testing suite covering all critical functionality:

### Quick Start
```powershell
cd tests
python run_all_tests.py
```

### Test Coverage
- ✅ **Module 1:** Encryption & Decryption (7 tests)
- ✅ **Module 2:** Key Management (8 tests)
- ✅ **Module 3:** Sharing & Permissions (5 tests)
- ✅ **Module 4:** Security Testing (24 tests)
- ✅ **Module 5:** Data Integrity (12 tests)

**Total:** 56+ tests | **Success Rate:** 100%

### Documentation
- 📖 [Comprehensive Testing Documentation](docs/COMPREHENSIVE_TESTING_DOCUMENTATION.md)
- 📋 [Testing Quick Reference](TESTING_QUICK_REFERENCE.md)
- 📁 [Test Suite README](tests/README.md)

---

## 🎯 Roadmap

- [x] End-to-end testing suite
- [x] Comprehensive test documentation
- [ ] Migrate from PostgreSQL BYTEA to filesystem storage
- [x] File sharing with encrypted key exchange
- [ ] File versioning
- [ ] Batch file operations
- [x] Mobile responsive improvements
- [ ] Docker deployment

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Sagar** - CyberSec-Sagar-Security

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
