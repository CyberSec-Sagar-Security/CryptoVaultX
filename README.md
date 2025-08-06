# 👨‍💻 **CryptoVault – Secure File Storage and Sharing System**  
📁 **Phase 3**: CI/CD Pipeline with GitHub Actions ✅ **COMPLETED**

![CI/CD Pipeline](https://github.com/CyberSec-Sagar-Security/CryptoVaultX/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![Node](https://img.shields.io/badge/node-18.x-green.svg)
![Docker](https://img.shields.io/badge/docker-supported-blue.svg)

---

## 🎯 **Phase 3 Overview - CI/CD Pipeline**

**Phase 3** establishes a comprehensive **GitHub Actions CI/CD pipeline** that automatically validates code quality, runs tests, and builds Docker containers on every push and pull request.

### ✅ **Phase 3 Status: COMPLETE**
- ✅ **Frontend Linting**: ESLint + Prettier validation
- ✅ **Backend Linting**: Flake8 Python code analysis  
- ✅ **Backend Testing**: Pytest with coverage reporting
- ✅ **Docker Build**: Full container build verification
- ✅ **Security Scanning**: Trivy vulnerability analysis
- ✅ **Caching**: NPM and pip dependency caching
- ✅ **CI Badge**: Real-time build status display

---

## 🚀 **CI/CD Workflow Features**

### **Automated Quality Checks**
| Check Type | Tool | Purpose |
|------------|------|---------|
| Frontend Linting | ESLint 9.x | React/JS code quality validation |
| Frontend Formatting | Prettier 3.x | Code style consistency |
| Backend Linting | Flake8 7.x | Python PEP8 compliance |
| Backend Testing | Pytest 8.x | Unit & integration test execution |
| Security Scanning | Trivy | Vulnerability detection |
| Docker Build | Docker Compose | Container deployment validation |

### **Pipeline Triggers**
- 🔄 **Push to `main`**: Full pipeline execution
- 🔄 **Push to `feature/*`**: Complete validation suite
- 🔄 **Pull Requests**: Comprehensive quality checks
- 🚫 **Automatic PR blocking**: Failed checks prevent merges

---

## ⚙️ **Tech Stack & Architecture**

| Layer     | Technology     | Purpose                                                               |
|-----------|----------------|-----------------------------------------------------------------------|
| Frontend  | React + Vite   | Fast build times, HMR, modular design, future-proof modern tooling    |
| Backend   | Flask (Python) | Lightweight REST API framework; easy to scale, secure, and integrate  |
| Database  | PostgreSQL 15  | Reliable relational DB with strong support for structured secure data |
| DevOps    | Docker Compose | Simplifies local development, CI/CD pipeline-ready, scalable services |
| CI/CD     | GitHub Actions | Automated testing, linting, security scanning, and deployment |

---

## 🚀 **Quick Start Guide**

### **Prerequisites**
- Docker Desktop installed and running
- Git (for cloning)

### **Steps to Run**
```bash
# 1. Clone the repository
git clone https://github.com/CyberSec-Sagar-Security/CryptoVaultX.git
cd CryptoVaultX

# 2. Start all services (builds automatically)
docker-compose up --build

# 3. Access the application
# Frontend: http://localhost:5173 (React App)
# Backend:  http://localhost:5000 (API)
# Database: localhost:5432 (PostgreSQL)

# 4. Stop services (optional)
docker-compose down
```

### **First Time Setup**
1. Copy environment template: `cp .env.sample .env`
2. Modify `.env` if needed (default values work out of the box)
3. Run `docker-compose up --build`

---

## ✅ **Phase 1 Achievements**

| Goal                           | Status | Description |
|--------------------------------|---------|-------------|
| 🎯 Dockerized Frontend        | ✅ | React + Vite container with production build using `serve` |
| 🎯 Dockerized Backend         | ✅ | Flask container with PostgreSQL connection |  
| 🎯 Database Setup             | ✅ | PostgreSQL 15 with persistent volume + environment config |
| 🎯 Container Networking       | ✅ | All services communicate via Docker bridge network |
| 🎯 Hot Reload Development     | ✅ | Vite supports fast development reload |
| 🎯 # 🔒 **CryptoVaultX** 
### Professional Full-Stack Cryptocurrency Portfolio Management Platform

> **Phase 1-3 Complete**: Dockerized React + Flask architecture with comprehensive CI/CD pipeline, automated testing, security scanning, and enterprise-grade development workflow. |
| 🎯 Health Checks             | ✅ | All services have health monitoring |
| 🎯 Environment Configuration  | ✅ | `.env` file support for all services |
| 🎯 Production Ready           | ✅ | Multi-stage builds, non-root users, security hardening |

---

## 🔧 **Key Technical Solutions**

### **Frontend-Backend Connection Fix**
- **Problem**: Frontend trying to connect to `localhost` (resolves to own container)
- **Solution**: Environment variable `VITE_API_BASE_URL=http://backend:5000`
- **Result**: ✅ Frontend successfully connects to backend via Docker service name

### **Docker Optimization**  
- Multi-stage builds for smaller production images
- Non-root users in all containers for security
- Health checks for service monitoring
- Layer caching for faster rebuilds

---

## 🏗️ **CI/CD Pipeline Architecture**

The GitHub Actions workflow includes 4 parallel jobs for comprehensive quality assurance:

### **Job 1: Frontend Linting (`lint-frontend`)**
```yaml
Environment: Node.js 18.x
Steps:
  - Cache npm dependencies for performance
  - Install frontend dependencies
  - Run ESLint with Prettier format validation
  - Report linting errors to PR checks
```

### **Job 2: Backend Testing (`lint-test-backend`)**
```yaml
Environment: Python 3.11 + PostgreSQL 15
Steps:
  - Setup PostgreSQL service container
  - Cache pip dependencies for performance
  - Install backend dependencies (Flask, Pytest, Flake8)
  - Run Flake8 linting (PEP8 compliance)
  - Execute Pytest suite with coverage reporting
  - Upload coverage reports to Codecov
```

### **Job 3: Docker Build (`build-docker`)**
```yaml
Dependencies: Frontend + Backend jobs must pass
Steps:
  - Setup Docker Buildx for advanced builds
  - Build backend container with health checks
  - Build frontend container with health checks
  - Verify container startup and API connectivity
  - Cleanup containers and images
```

### **Job 4: Security Scan (`security-scan`)**
```yaml
Dependencies: Docker build must complete
Tools: Trivy security scanner
Steps:
  - Scan Docker images for vulnerabilities
  - Generate SARIF security report
  - Upload results to GitHub Security tab
  - Block PR if critical vulnerabilities found
```

### **Local CI/CD Simulation**
```bash
# Run frontend linting locally
cd frontend
npm run lint

# Run backend linting and tests locally  
cd backend
pip install -r requirements.txt
flake8 .
pytest --cov=.

# Build and test Docker containers locally
docker-compose build
docker-compose up -d
docker-compose ps  # Verify all services healthy
```

---

## 🧪 **Testing & Verification**

### **Service Health**
```bash
# Check all services are running and healthy
docker ps

# Test backend API
curl http://localhost:5000/
curl http://localhost:5000/health

# View logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs db
```

### **Frontend Integration**
- Open http://localhost:5173
- Should display: "✅ CryptoVault Backend Running!"
- Indicates successful frontend-backend communication

---

**🎉 Phase 1: Dockerized Full-Stack Setup - COMPLETE! ✅**
