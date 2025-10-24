# 🗂️ CryptoVaultX - Organized Project Structure

## 📋 Project Overview

CryptoVaultX is a secure file storage application with client-side encryption capabilities. The project has been completely reorganized into a professional, maintainable structure with clear separation of concerns.

## 🏗️ New Project Architecture

```
CryptoVaultX/
├── 📁 core/                          # CORE APPLICATION MODULES
│   ├── 📁 backend/                   # Python Flask API Backend
│   │   ├── app.py                    # Main Flask application
│   │   ├── config.py                 # Configuration settings
│   │   ├── database.py               # Database connection & management
│   │   ├── models.py                 # Database models
│   │   ├── requirements.txt          # Python dependencies
│   │   ├── 📁 middleware/            # Authentication & validation
│   │   ├── 📁 routes/                # API route handlers
│   │   ├── 📁 migrations/            # Database migrations
│   │   └── 📁 uploads/               # File storage directory
│   └── 📁 frontend/                  # React TypeScript Frontend
│       ├── package.json              # Node.js dependencies
│       ├── vite.config.ts            # Vite build configuration
│       ├── index.html                # Main HTML template
│       └── 📁 src/                   # Source code
│           ├── 📁 components/        # Reusable UI components
│           ├── 📁 pages/             # Page components
│           ├── 📁 services/          # API communication
│           ├── 📁 lib/               # Utility libraries
│           ├── 📁 contexts/          # React contexts
│           └── 📁 router/            # Application routing
├── 📁 operations/                    # OPERATIONAL MODULES
│   ├── 📁 scripts/                   # Startup & deployment scripts
│   │   ├── start-backend.ps1         # Start Flask backend
│   │   ├── start-frontend.ps1        # Start React frontend
│   │   ├── start-backend-node.ps1    # Start Node.js backend (archive)
│   │   └── start-all-services.ps1    # Start all services
│   ├── 📁 docker/                    # Docker configuration
│   │   └── docker-compose.yml        # Container orchestration
│   └── 📁 database/                  # Database initialization
│       └── init-db.sql               # Database schema
├── 📁 testing/                       # TESTING MODULES
│   ├── 📁 backend-tests/             # Python/Flask tests
│   │   ├── test_auth_fix.py          # Authentication tests
│   │   ├── test_registration.py      # User registration tests
│   │   ├── check_user.py             # User verification utility
│   │   ├── debug_users.py            # User debugging tools
│   │   ├── debug.py                  # General debugging
│   │   └── trace_bug.py              # Bug tracing utility
│   ├── 📁 frontend-tests/            # React/TypeScript tests
│   │   └── test_implementation.js    # Implementation tests
│   ├── 📁 integration-tests/         # End-to-end tests
│   │   ├── test_simple_upload.ps1    # File upload tests
│   │   ├── test_upload_api.ps1       # API upload tests
│   │   ├── test_upload_workflow.ps1  # Full workflow tests
│   │   ├── verify_implementation.ps1 # Implementation verification
│   │   ├── test_encrypted_upload.txt # Test data files
│   │   ├── test_encryption_file.txt
│   │   └── test_upload.txt
│   └── 📁 professor-demo/            # Academic demonstration
│       ├── demo-script.html          # Comprehensive demo
│       ├── encryption-test.html      # Encryption module tests
│       ├── key-management-test.html  # Key management tests
│       ├── run-all-tests.ps1         # Test automation
│       └── README.md                 # Demo documentation
├── 📁 docs/                          # DOCUMENTATION
│   ├── 📁 guides/                    # User & developer guides
│   │   ├── API_DOCS.md               # API documentation
│   │   ├── API_DOCUMENTATION.md      # Detailed API specs
│   │   └── TECHNICAL_SPECIFICATION.md # Technical specifications
│   ├── 📁 implementation/            # Implementation details
│   │   ├── IMPLEMENTATION_COMPLETE.md         # Implementation status
│   │   ├── IMPLEMENTATION_VALIDATION_REPORT.md # Validation results
│   │   ├── LOCAL_STORAGE_DOCUMENTATION.md     # Storage docs
│   │   ├── LOCAL_STORAGE_IMPLEMENTATION.md    # Storage implementation
│   │   └── DOWNLOAD_DECRYPT_IMPLEMENTATION_COMPLETE.md
│   ├── 📁 reports/                   # Project reports
│   │   ├── COMPLETE_FIX_SUMMARY.md   # Fix summaries
│   │   ├── ROOT_CAUSE_ANALYSIS_AND_SOLUTION.md # Analysis reports
│   │   ├── ENCRYPTED_UPLOAD_TEST_PLAN.md # Test plans
│   │   └── FRONTEND_MIGRATION_COMPLETE.md # Migration reports
│   ├── PROJECT_OVERVIEW.md          # Project overview
│   └── README.md                     # Main documentation
├── 📁 archive/                       # LEGACY/EXPERIMENTAL CODE
│   └── 📁 backend-node/              # Alternative Node.js backend
│       ├── server.js                 # Node.js server
│       ├── package.json              # Node dependencies
│       ├── 📁 routes/                # Node.js routes
│       ├── 📁 middleware/            # Node.js middleware
│       └── 📁 tests/                 # Node.js tests
├── .gitignore                        # Git ignore rules
├── start.ps1                         # Main startup script
└── PROJECT_STRUCTURE.md              # This documentation
```

## 🎯 Module Descriptions

### 🔥 Core Modules (Production Code)

#### Backend (`core/backend/`)
- **Purpose**: Python Flask REST API backend
- **Technology**: Python 3.x, Flask, SQLAlchemy, PostgreSQL
- **Features**: File upload/download, user authentication, encryption support
- **Entry Point**: `app.py`

#### Frontend (`core/frontend/`)
- **Purpose**: React TypeScript web application
- **Technology**: React 18, TypeScript, Vite, Web Crypto API
- **Features**: File encryption/decryption, secure file management, user interface
- **Entry Point**: `src/main.tsx`

### ⚙️ Operations Modules (Infrastructure)

#### Scripts (`operations/scripts/`)
- **Purpose**: Development and deployment automation
- **Technology**: PowerShell scripts
- **Features**: Service startup, environment management, testing automation

#### Docker (`operations/docker/`)
- **Purpose**: Containerization and orchestration
- **Technology**: Docker, Docker Compose
- **Features**: Multi-service deployment, environment isolation

#### Database (`operations/database/`)
- **Purpose**: Database initialization and schema management
- **Technology**: PostgreSQL SQL scripts
- **Features**: Schema creation, initial data seeding

### 🧪 Testing Modules (Quality Assurance)

#### Backend Tests (`testing/backend-tests/`)
- **Purpose**: Python backend testing and debugging
- **Technology**: Python test scripts
- **Features**: Unit tests, integration tests, debugging utilities

#### Frontend Tests (`testing/frontend-tests/`)
- **Purpose**: React frontend testing
- **Technology**: JavaScript/TypeScript test files
- **Features**: Component tests, workflow validation

#### Integration Tests (`testing/integration-tests/`)
- **Purpose**: End-to-end system testing
- **Technology**: PowerShell automation scripts
- **Features**: Full workflow testing, API validation, file upload/download testing

#### Professor Demo (`testing/professor-demo/`)
- **Purpose**: Academic demonstration and validation
- **Technology**: Interactive HTML pages with JavaScript
- **Features**: Live encryption/decryption demos, key management validation

### 📚 Documentation (`docs/`)
- **Purpose**: Comprehensive project documentation
- **Organization**: Structured by documentation type
- **Features**: API docs, implementation guides, technical specifications

### 🗄️ Archive (`archive/`)
- **Purpose**: Legacy and experimental code
- **Technology**: Alternative implementations
- **Features**: Node.js backend alternative, experimental features

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- PowerShell 5.1+

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CryptoVaultX
   ```

2. **Start all services**
   ```powershell
   .\start.ps1
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - API Documentation: http://localhost:5000/docs

### Development Workflow

#### Backend Development
```powershell
cd core\backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

#### Frontend Development
```powershell
cd core\frontend
npm install
npm run dev
```

#### Running Tests
```powershell
# Backend tests
cd testing\backend-tests
python test_auth_fix.py

# Integration tests
cd testing\integration-tests
.\test_upload_workflow.ps1

# Professor demo
cd testing\professor-demo
.\run-all-tests.ps1
```

## 🔧 Configuration

### Environment Variables
- Backend: `core/backend/.env`
- Frontend: `core/frontend/.env`

### Database Configuration
- Schema: `operations/database/init-db.sql`
- Migrations: `core/backend/migrations/`

### Docker Configuration
- Compose: `operations/docker/docker-compose.yml`

## 📈 Benefits of New Structure

1. **🎯 Clear Separation of Concerns**: Core code separated from operations and testing
2. **🔧 Better Maintainability**: Logical grouping of related functionality
3. **👥 Team Collaboration**: Easy to assign work by module responsibility
4. **📱 Scalability**: Easy to add new modules or services
5. **🧪 Testing Organization**: Comprehensive testing structure by type
6. **📚 Documentation**: Well-organized documentation by purpose
7. **🚀 Professional Standards**: Industry-standard project layout

## 🎓 Academic Demonstration

The `testing/professor-demo/` module provides comprehensive demonstrations of:
- **Encryption/Decryption Module**: Client-side cryptographic operations
- **Key Management Module**: Secure key generation and management
- **Interactive Testing**: Real-time validation of security features

## 🔒 Security Features

- **Client-side Encryption**: AES-256-GCM encryption before upload
- **Session-based Key Management**: Keys stored in sessionStorage only
- **Zero Knowledge**: Server never sees encryption keys
- **Secure Authentication**: JWT-based user authentication
- **Data Integrity**: Cryptographic verification of file integrity

## 📞 Support & Contributing

- **Documentation**: See `docs/` directory
- **Issues**: Use the testing modules to validate functionality
- **Contributing**: Follow the modular structure when adding features

---

*This structure represents a complete reorganization for professional development, academic demonstration, and production deployment.*