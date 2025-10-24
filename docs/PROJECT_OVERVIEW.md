# CryptoVault: Encrypted File Storage and Sharing Platform

## 📋 Project Information

**Project Title:** CryptoVault - An Encrypted File Storage and Sharing Platform

**Project Number:** Project 43

**Repository:** CyberSec-Sagar-Security/CryptoVaultX

**Current Branch:** fix/auth-validation-sagar

**Last Updated:** October 12, 2025

---

## 🎯 Project Summary

CryptoVault is a secure web-based file storage and sharing system that implements end-to-end encryption for all uploaded files. The system provides users with a private and secure way to store and share sensitive documents, ensuring data confidentiality and integrity through robust cryptographic measures.

### Key Features
- **Client-Side Encryption**: Files are encrypted on the client-side before transmission
- **End-to-End Security**: Even the service provider cannot access plaintext data
- **Secure Sharing**: Encrypted files can be shared securely with authorized users
- **Zero-Knowledge Architecture**: Server never has access to unencrypted data
- **User-Friendly Interface**: Intuitive UI built with modern web technologies

---

## 🔍 Problem Statement

Cloud storage and file sharing services often lack robust encryption, leaving user data vulnerable to:
- Data breaches and unauthorized access
- Government surveillance and data requests
- Internal threats from service providers
- Man-in-the-middle attacks during transmission
- Inadequate access control mechanisms

**Users need a trustworthy platform that prioritizes data privacy and security through strong cryptographic measures.**

---

## 💡 Proposed Solution

CryptoVault implements a file storage and sharing system that enforces **client-side encryption**, ensuring that data is encrypted before it leaves the user's device. This approach guarantees that:

1. **Data is encrypted at the source** (user's browser)
2. **Server only stores encrypted data** (ciphertext)
3. **Encryption keys never leave the client** (zero-knowledge)
4. **End-to-end confidentiality** is maintained throughout the file lifecycle
5. **Secure key wrapping** enables safe file sharing

---

## 🎯 Project Objectives

1. ✅ **Design and implement a web-based platform** for file upload and download
2. ✅ **Integrate client-side encryption** (AES-256-GCM) for all uploaded files
3. ✅ **Implement secure key management** for encryption/decryption keys with RSA-OAEP key wrapping
4. 🔄 **Enable secure sharing** of encrypted files between users (In Progress)
5. ✅ **Ensure strong user authentication** and access control with JWT tokens
6. ✅ **Implement secure password hashing** using bcrypt
7. ✅ **Create responsive and intuitive UI** using React and shadcn/ui

**Legend:**
- ✅ Completed
- 🔄 In Progress
- ⏳ Planned
- ❌ Not Started

---

## 📦 Scope of the Project

### In Scope

1. **Web Application Features:**
   - ✅ User registration and authentication
   - ✅ Secure login with JWT tokens
   - ✅ File upload with client-side encryption
   - ✅ File download with client-side decryption
   - 🔄 Secure file sharing between users
   - ✅ File management dashboard
   - ✅ User profile management

2. **Security Features:**
   - ✅ Client-side encryption/decryption using AES-256-GCM
   - ✅ RSA-OAEP for key wrapping
   - ✅ Secure key management
   - ✅ Password hashing with bcrypt
   - ✅ JWT-based authentication
   - ✅ CORS protection
   - 🔄 Rate limiting
   - 🔄 Input validation and sanitization

3. **File Support:**
   - ✅ Text files (txt, md, json, etc.)
   - ✅ Binary files (images, documents, pdfs)
   - ✅ File size limits (configurable)
   - ✅ Multiple file format support

4. **Storage:**
   - ✅ Server-side storage of encrypted files
   - ✅ PostgreSQL database for metadata
   - ✅ File metadata tracking (name, size, type, upload date)

### Out of Scope

1. ❌ Advanced distributed key management systems
2. ❌ Integration with hardware security modules (HSM)
3. ❌ Large-scale cloud storage integration (AWS S3, Azure Blob)
4. ❌ Real-time collaborative editing of encrypted files
5. ❌ Complex version control for files
6. ❌ Mobile native applications (iOS/Android)
7. ❌ Enterprise SSO integration
8. ❌ Blockchain-based audit trails

---

## 🏗️ System Architecture

### Technology Stack

#### Frontend
- **Framework:** React 18.3+ with TypeScript
- **Build Tool:** Vite 6.3
- **UI Library:** shadcn/ui (Radix UI primitives)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **State Management:** React Context API
- **Crypto Library:** Web Crypto API (native browser)
- **HTTP Client:** Fetch API with custom service layer

#### Backend
- **Framework:** Flask 3.1.0 (Python)
- **Database:** PostgreSQL 17
- **ORM:** SQLAlchemy 2.0+
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **CORS:** Flask-CORS
- **Migrations:** Alembic (planned)

#### DevOps & Tools
- **Containerization:** Docker & Docker Compose
- **Version Control:** Git & GitHub
- **Development OS:** Windows with PowerShell
- **Package Managers:** npm (frontend), pip (backend)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌────────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │  React UI      │  │  Crypto Lib  │  │  API Services   │ │
│  │  (TypeScript)  │◄─┤ (Web Crypto) │◄─┤  (Fetch/Axios)  │ │
│  └────────────────┘  └──────────────┘  └─────────────────┘ │
│         │                    │                    │          │
└─────────┼────────────────────┼────────────────────┼──────────┘
          │                    │                    │
          │ HTTPS (TLS)        │ Encryption Keys    │ API Calls
          │                    │ (Never Sent)       │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend Server                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Flask Application (Python)                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │ │
│  │  │ Auth Routes  │  │ File Routes  │  │Share Routes  │ │ │
│  │  │  /auth/*     │  │  /files/*    │  │  /shares/*   │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘ │ │
│  │         │                  │                  │         │ │
│  │  ┌──────▼──────────────────▼──────────────────▼──────┐ │ │
│  │  │           Middleware Layer                         │ │ │
│  │  │  - JWT Authentication                              │ │ │
│  │  │  - Request Validation                              │ │ │
│  │  │  - Error Handling                                  │ │ │
│  │  └───────────────────────────┬────────────────────────┘ │ │
│  └──────────────────────────────┼──────────────────────────┘ │
│                                  ▼                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Database Layer (SQLAlchemy)           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │
│  │  │  Users   │  │  Files   │  │  Shares  │            │ │
│  │  │  Model   │  │  Model   │  │  Model   │            │ │
│  │  └──────────┘  └──────────┘  └──────────┘            │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  users   │  │  files   │  │  shares  │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                File Storage (Encrypted Files)                │
│                    backend/uploads/*.enc                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 System Modules

### 1. User Authentication Module ✅
**Status:** Completed

**Functionality:**
- User registration with email validation
- Secure login with JWT tokens
- Password strength validation (8+ chars, uppercase, lowercase, numbers, special chars)
- Password hashing using bcrypt
- Token-based session management
- Logout functionality

**Files:**
- Frontend: `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`
- Backend: `backend/routes/auth.py`, `backend/middleware/auth.py`
- Models: `backend/models.py` (User model)

### 2. File Upload/Download Module ✅
**Status:** Completed

**Functionality:**
- Drag-and-drop file upload interface
- Client-side file encryption (AES-256-GCM)
- File chunking for large files
- Upload progress tracking
- Encrypted file storage on server
- Secure file download with decryption
- File type detection and validation
- File size limits

**Files:**
- Frontend: `src/pages/Upload.tsx`, `src/pages/FilesPage.tsx`
- Backend: `backend/routes/files.py`
- Crypto: `src/services/crypto.ts`

### 3. Encryption/Decryption Module ✅
**Status:** Completed

**Functionality:**
- AES-256-GCM encryption for files
- RSA-OAEP for key wrapping
- Key generation and management
- Secure random IV generation
- Authentication tag verification
- Error handling for crypto operations

**Files:**
- Frontend: `src/services/crypto.ts`
- Implementation: Web Crypto API (native)

### 4. Key Management Module ✅
**Status:** Completed

**Functionality:**
- Master key generation per user
- Key derivation using PBKDF2
- RSA key pair generation for sharing
- Secure key storage (encrypted)
- Key wrapping for file sharing
- Key rotation support (planned)

**Files:**
- Frontend: `src/services/crypto.ts`
- Backend: `backend/models.py` (wrapped_key field)

### 5. Sharing Module 🔄
**Status:** In Progress

**Functionality:**
- Share encrypted files with other users
- Key re-encryption for recipients
- Access permission management
- Share link generation
- Revoke access functionality
- Share expiration (planned)

**Files:**
- Backend: `backend/routes/shares.py`
- Frontend: In Development

### 6. Access Control Module ✅
**Status:** Completed

**Functionality:**
- JWT-based authentication middleware
- Role-based access control
- Resource ownership validation
- Protected route enforcement
- Session management

**Files:**
- Backend: `backend/middleware/auth.py`
- Frontend: `src/contexts/AuthContext.tsx`

### 7. Dashboard Module ✅
**Status:** Completed

**Functionality:**
- File overview and statistics
- Recent files listing
- Storage usage tracking
- Quick action buttons
- File search and filtering

**Files:**
- Frontend: `src/pages/Dashboard.tsx`

---

## ⚙️ Functional Requirements

### User Management
- ✅ **FR-1:** Users must be able to register with email and password
- ✅ **FR-2:** Users must be able to log in securely with credentials
- ✅ **FR-3:** System must validate password strength (8+ chars, mixed case, numbers, special chars)
- ✅ **FR-4:** System must hash passwords using bcrypt before storage
- ✅ **FR-5:** Users must be able to log out and invalidate sessions
- 🔄 **FR-6:** Users must be able to reset forgotten passwords
- 🔄 **FR-7:** Users must be able to update profile information

### File Operations
- ✅ **FR-8:** Users must be able to upload files via drag-and-drop or file picker
- ✅ **FR-9:** Files must be encrypted client-side before upload (AES-256-GCM)
- ✅ **FR-10:** System must store only encrypted files on server
- ✅ **FR-11:** Users must be able to download and decrypt their own files
- ✅ **FR-12:** System must track file metadata (name, size, type, upload date)
- ✅ **FR-13:** Users must be able to delete their own files
- 🔄 **FR-14:** Users must be able to rename files
- ⏳ **FR-15:** System must support file versioning

### File Sharing
- 🔄 **FR-16:** Users must be able to share encrypted files with registered users
- 🔄 **FR-17:** System must re-encrypt file keys for recipients
- 🔄 **FR-18:** Only authorized users can access shared files
- 🔄 **FR-19:** File owners can revoke sharing access
- ⏳ **FR-20:** System must support share expiration dates
- ⏳ **FR-21:** System must log all file access attempts

### Security
- ✅ **FR-22:** System must use HTTPS for all communications
- ✅ **FR-23:** System must implement CORS protection
- ✅ **FR-24:** System must validate all user inputs
- ✅ **FR-25:** System must implement JWT-based authentication
- 🔄 **FR-26:** System must implement rate limiting on API endpoints
- 🔄 **FR-27:** System must log security events

---

## 🔒 Non-Functional Requirements

### Security
- ✅ **NFR-1:** All files must be encrypted using AES-256-GCM
- ✅ **NFR-2:** Encryption keys must never be transmitted to server
- ✅ **NFR-3:** Passwords must be hashed using bcrypt (cost factor 12+)
- ✅ **NFR-4:** System must implement protection against common web vulnerabilities (XSS, CSRF, SQL Injection)
- ✅ **NFR-5:** All API endpoints must use authentication middleware
- 🔄 **NFR-6:** System must implement rate limiting (100 requests/minute per user)
- 🔄 **NFR-7:** System must implement input sanitization

### Confidentiality
- ✅ **NFR-8:** Data must remain encrypted at rest
- ✅ **NFR-9:** Data must be encrypted in transit (HTTPS/TLS)
- ✅ **NFR-10:** Server must never have access to plaintext data
- ✅ **NFR-11:** Encryption keys must be securely wrapped before storage

### Integrity
- ✅ **NFR-12:** Files must include authentication tags (GCM mode)
- ✅ **NFR-13:** System must verify file integrity during decryption
- ✅ **NFR-14:** Database must use constraints to prevent data corruption
- 🔄 **NFR-15:** System must implement audit logging for all operations

### Usability
- ✅ **NFR-16:** Interface must be intuitive and user-friendly
- ✅ **NFR-17:** System must provide clear error messages
- ✅ **NFR-18:** Upload/download must show progress indicators
- ✅ **NFR-19:** System must be responsive (mobile, tablet, desktop)
- ✅ **NFR-20:** File operations must complete within reasonable time

### Performance
- ✅ **NFR-21:** File encryption must not introduce significant delays (<2s for 10MB files)
- ✅ **NFR-22:** Page load time must be under 3 seconds
- ✅ **NFR-23:** API response time must be under 500ms for non-file operations
- 🔄 **NFR-24:** System must handle concurrent users (target: 100+ concurrent)
- 🔄 **NFR-25:** Database queries must be optimized with proper indexing

### Reliability
- ✅ **NFR-26:** System must handle errors gracefully without data loss
- ✅ **NFR-27:** Failed uploads must be cleanly recoverable
- 🔄 **NFR-28:** System uptime must be 99%+
- 🔄 **NFR-29:** System must implement automated backups

### Maintainability
- ✅ **NFR-30:** Code must follow industry best practices
- ✅ **NFR-31:** Code must be well-documented with comments
- ✅ **NFR-32:** System must use version control (Git)
- ✅ **NFR-33:** System must have clear project structure
- 🔄 **NFR-34:** System must include comprehensive documentation

---

## 📁 Project Structure

```
CryptoVault/
├── 📄 README.md                          # Main project readme
├── 📄 docker-compose.yml                 # Docker orchestration
├── 📄 init-db.sql                        # Database initialization
│
├── 📁 backend/                           # Flask backend
│   ├── 📄 app.py                         # Main Flask application
│   ├── 📄 config.py                      # Configuration management
│   ├── 📄 database.py                    # Database connection
│   ├── 📄 models.py                      # SQLAlchemy models
│   ├── 📄 requirements.txt               # Python dependencies
│   ├── 📄 Dockerfile                     # Backend container
│   │
│   ├── 📁 middleware/                    # Middleware components
│   │   ├── 📄 __init__.py
│   │   └── 📄 auth.py                    # JWT authentication
│   │
│   ├── 📁 routes/                        # API route handlers
│   │   ├── 📄 __init__.py
│   │   ├── 📄 auth.py                    # Authentication routes
│   │   ├── 📄 files.py                   # File operation routes
│   │   ├── 📄 health.py                  # Health check endpoint
│   │   └── 📄 shares.py                  # File sharing routes
│   │
│   ├── 📁 migrations/                    # Database migrations
│   │   └── 📁 versions/
│   │
│   └── 📁 uploads/                       # Encrypted file storage
│       └── 📄 *.enc                      # Encrypted files
│
├── 📁 Frontend_New/                      # React frontend
│   ├── 📄 index.html                     # Entry HTML
│   ├── 📄 package.json                   # Node dependencies
│   ├── 📄 vite.config.ts                 # Vite configuration
│   ├── 📄 tsconfig.json                  # TypeScript config
│   ├── 📄 tailwind.config.js             # Tailwind CSS config
│   │
│   ├── 📁 src/                           # Source code
│   │   ├── 📄 main.tsx                   # React entry point
│   │   ├── 📄 App.tsx                    # Main App component
│   │   ├── 📄 index.css                  # Global styles
│   │   │
│   │   ├── 📁 pages/                     # Page components
│   │   │   ├── 📄 Dashboard.tsx          # Dashboard page
│   │   │   ├── 📄 LoginPage.tsx          # Login page
│   │   │   ├── 📄 RegisterPage.tsx       # Registration page
│   │   │   ├── 📄 Upload.tsx             # File upload page
│   │   │   ├── 📄 FilesPage.tsx          # File management page
│   │   │   ├── 📄 PrivacyPolicy.tsx      # Privacy policy
│   │   │   └── 📄 TermsOfService.tsx     # Terms of service
│   │   │
│   │   ├── 📁 components/                # Reusable components
│   │   │   ├── 📁 ui/                    # shadcn/ui components
│   │   │   ├── 📄 FileUpload.tsx         # File upload component
│   │   │   ├── 📄 FileList.tsx           # File listing component
│   │   │   └── 📄 Navigation.tsx         # Navigation component
│   │   │
│   │   ├── 📁 services/                  # Service layer
│   │   │   ├── 📄 api.ts                 # API client
│   │   │   └── 📄 crypto.ts              # Cryptography functions
│   │   │
│   │   ├── 📁 contexts/                  # React contexts
│   │   │   └── 📄 AuthContext.tsx        # Authentication context
│   │   │
│   │   ├── 📁 router/                    # Routing configuration
│   │   │   └── 📄 AppRouter.tsx          # Route definitions
│   │   │
│   │   └── 📁 styles/                    # Style files
│   │
│   └── 📁 build/                         # Production build
│
├── 📁 scripts/                           # Utility scripts
│   ├── 📄 start-frontend.ps1             # Start frontend server
│   ├── 📄 start-backend.ps1              # Start backend server
│   ├── 📄 start-all-services.ps1         # Start all services
│   └── 📄 test-frontend.ps1              # Frontend validation
│
└── 📁 docs/                              # Documentation
    ├── 📄 PROJECT_OVERVIEW.md            # This file
    ├── 📄 TECHNICAL_SPECIFICATION.md     # Technical details
    ├── 📄 API_DOCUMENTATION.md           # API reference
    ├── 📄 SECURITY_DESIGN.md             # Security architecture
    ├── 📄 DEPLOYMENT_GUIDE.md            # Deployment instructions
    ├── 📄 TESTING_PLAN.md                # Testing strategy
    └── 📄 USER_GUIDE.md                  # End-user documentation
```

---

## 🎯 Current Status

### Completed Features ✅

1. **User Authentication System**
   - User registration with validation
   - Secure login with JWT tokens
   - Password hashing with bcrypt
   - Protected routes and middleware
   - Session management

2. **File Upload System**
   - Drag-and-drop interface
   - Client-side AES-256-GCM encryption
   - File metadata tracking
   - Progress indicators
   - Error handling

3. **File Download System**
   - Secure file retrieval
   - Client-side decryption
   - File type detection
   - Download progress tracking

4. **Encryption Infrastructure**
   - AES-256-GCM implementation
   - RSA-OAEP key wrapping
   - Secure key generation
   - IV and authentication tag handling

5. **User Interface**
   - Responsive design
   - Modern UI with shadcn/ui
   - Dashboard with file overview
   - Navigation and routing

### In Progress 🔄

1. **File Sharing System**
   - Backend routes implemented
   - Key re-encryption logic
   - Frontend UI pending
   - Access control testing

2. **Authentication Fixes**
   - Login/register validation alignment
   - Terms/Privacy policy routing
   - Error handling improvements

3. **Testing Infrastructure**
   - Unit tests for crypto functions
   - Integration tests for API
   - E2E testing setup

### Planned Features ⏳

1. **Advanced Security**
   - Rate limiting implementation
   - Input sanitization
   - Audit logging
   - Security event monitoring

2. **User Features**
   - Password reset functionality
   - Email verification
   - Profile management
   - Two-factor authentication

3. **File Management**
   - File renaming
   - File versioning
   - Bulk operations
   - File search and filtering

4. **Performance Optimization**
   - File chunking for large files
   - Compression before encryption
   - Caching strategies
   - Database query optimization

---

## 📝 Next Steps

### Immediate (This Sprint)
1. Fix authentication validation issues
2. Complete Terms/Privacy policy pages
3. Test file sharing functionality
4. Implement rate limiting
5. Add input validation middleware

### Short Term (Next 2-4 Weeks)
1. Complete file sharing UI
2. Implement password reset
3. Add email verification
4. Create comprehensive test suite
5. Security audit and penetration testing

### Medium Term (1-3 Months)
1. Implement file versioning
2. Add bulk file operations
3. Create admin dashboard
4. Implement audit logging
5. Performance optimization

### Long Term (3-6 Months)
1. Mobile application development
2. Enterprise features (SSO, LDAP)
3. Advanced analytics
4. Compliance certifications (SOC2, ISO27001)
5. Scale to support 1000+ concurrent users

---

## 👥 Team & Contributions

**Project Lead:** Sagar (CyberSec-Sagar-Security)

**Development Team:**
- Full-stack development
- Security implementation
- UI/UX design
- Documentation

**Technologies & Libraries:**
- React, TypeScript, Vite
- Flask, SQLAlchemy, PostgreSQL
- Web Crypto API
- shadcn/ui, Tailwind CSS
- Docker, Git

---

## 📚 Additional Documentation

For more detailed information, please refer to:

- **[Technical Specification](./TECHNICAL_SPECIFICATION.md)** - Detailed technical design
- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Security Design](./SECURITY_DESIGN.md)** - Security architecture and threat model
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Testing Plan](./TESTING_PLAN.md)** - Comprehensive testing strategy
- **[User Guide](./USER_GUIDE.md)** - End-user documentation

---

## 📄 License

This project is developed for educational purposes as part of a college software project.

**Copyright © 2025 CyberSec-Sagar-Security. All rights reserved.**

---

*Last Updated: October 12, 2025*
