# 👨‍💻 **CryptoVault – Secure File Storage and Sharing System**  
📁 **Phase 1**: Full-Stack Dockerized Setup ✅ **COMPLETED**

---

## 🎯 **Phase 1 Overview**

The goal of **Phase 1** was to establish a robust and professional full-stack development environment using Docker Compose. This phase focuses entirely on building a *containerized architecture* with **complete frontend-backend integration**.

### ✅ **Phase 1 Status: COMPLETE**
- ✅ Frontend: React + Vite (Port 5173)
- ✅ Backend: Python + Flask (Port 5000) 
- ✅ Database: PostgreSQL 15 (Port 5432)
- ✅ **Frontend-Backend Connection: WORKING**
- ✅ Docker Compose orchestration
- ✅ Health checks on all services
- ✅ Environment-based configuration
- ✅ Production-ready containers

---

## ⚙️ **Tech Stack & Architecture**

| Layer     | Technology     | Purpose                                                               |
|-----------|----------------|-----------------------------------------------------------------------|
| Frontend  | React + Vite   | Fast build times, HMR, modular design, future-proof modern tooling    |
| Backend   | Flask (Python) | Lightweight REST API framework; easy to scale, secure, and integrate  |
| Database  | PostgreSQL 15  | Reliable relational DB with strong support for structured secure data |
| DevOps    | Docker Compose | Simplifies local development, CI/CD pipeline-ready, scalable services |

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
| 🎯 **Frontend-Backend Connection** | ✅ | **FIXED: Frontend successfully connects to backend API** |
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
