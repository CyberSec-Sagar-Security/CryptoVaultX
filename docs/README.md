# CryptoVault

A secure file storage and sharing platform with client-side encryption.

## Features

- 🔐 Client-side AES-256-GCM encryption
- 👥 Secure file sharing between users
- 🔑 JWT-based authentication
- 🐳 Docker containerized deployment
- 🗄️ PostgreSQL database with SQLAlchemy ORM

## Tech Stack

- **Backend**: Python Flask with Flask-RESTful
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (access + refresh tokens)
- **Encryption**: AES-256-GCM (client-side)
- **Frontend**: React (to be implemented)
- **Deployment**: Docker Compose

## Project Structure

```
CryptoVault/
├── backend/
│   ├── app.py              # Flask application entry point
│   ├── config.py           # Configuration settings
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile         # Backend container configuration
│   ├── .env               # Environment variables
│   ├── routes/            # API route blueprints
│   │   ├── __init__.py
│   │   └── health.py      # Health check endpoint
│   ├── migrations/        # Database migrations
│   └── uploads/           # File storage directory
├── frontend/              # React frontend (to be implemented)
├── docker-compose.yml     # Multi-container setup
├── init-db.sql           # Database initialization
└── README.md             # This file
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)
- PostgreSQL 15+ (for local development)

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   cd CryptoVault
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Check service status:**
   ```bash
   docker-compose ps
   ```

4. **Test the health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Local Development

1. **Set up the database:**
   ```bash
   # Start PostgreSQL container only
   docker-compose up -d db
   ```

2. **Set up Python environment:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Initialize the database:**
   ```bash
   export FLASK_APP=app.py
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

4. **Run the development server:**
   ```bash
   python app.py
   ```

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Authentication (Phase 2) ✅
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT tokens)
- `POST /api/auth/refresh` - Refresh JWT access token  
- `GET /api/auth/me` - Get current user info (protected)
- `POST /api/auth/logout` - Logout user

### File Management (Phase 3) ✅
- `POST /api/files` - Upload encrypted file with metadata
- `GET /api/files` - List user's files (with pagination)
- `GET /api/files/:id` - Download encrypted file
- `GET /api/files/:id/info` - Get file metadata only
- `DELETE /api/files/:id` - Delete file (owner only)
- `GET /api/files/stats` - Get user's file statistics

### Future Endpoints (to be implemented)
- `POST /api/shares` - Share file with user
- `GET /api/shares` - List shared files
- `DELETE /api/shares/:id` - Remove file share

## Development Phases

- [x] **Phase 1**: Backend skeleton + Database setup
- [x] **Phase 2**: User authentication (register/login) + JWT tokens
- [x] **Phase 3**: File upload/download APIs + metadata storage
- [ ] **Phase 4**: File sharing between users
- [ ] **Phase 5**: Frontend React app + client-side encryption
- [ ] **Phase 6**: Advanced security features
- [ ] **Phase 7**: Testing & deployment optimization

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `development` |
| `SECRET_KEY` | Flask secret key | `dev-secret-key...` |
| `JWT_SECRET_KEY` | JWT signing key | `dev-jwt-secret...` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- CORS protection
- File access control
- Client-side encryption (AES-256-GCM)
- Secure file sharing with key re-wrapping

## License

MIT License - see LICENSE file for details.
