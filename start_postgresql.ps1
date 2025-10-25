# CryptoVault PostgreSQL Implementation - Startup & Testing Guide

Write-Host "=== CryptoVault PostgreSQL Storage Setup ===" -ForegroundColor Green
Write-Host "Implementation: Encrypted files in PostgreSQL BYTEA with 600MB quota" -ForegroundColor Cyan

# Step 1: Database Migration
Write-Host "`n🔧 Step 1: Run Database Migration" -ForegroundColor Yellow
Write-Host "Run this in Window C (Database/Migration):" -ForegroundColor Gray
Write-Host ".\operations\scripts\run-migration.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Alternative manual command:" -ForegroundColor Gray  
Write-Host "psql -U postgres -d cryptovault_db -f core\backend\migrations\20251026_create_files_table.sql" -ForegroundColor White

# Step 2: Backend
Write-Host "`n🖥️  Step 2: Start Backend (Keep Window A open)" -ForegroundColor Yellow
Write-Host "Run this in Window A (Backend):" -ForegroundColor Gray
Write-Host "cd core\backend" -ForegroundColor White
Write-Host "python app.py" -ForegroundColor White

# Step 3: Frontend  
Write-Host "`n🌐 Step 3: Start Frontend (Keep Window B open)" -ForegroundColor Yellow
Write-Host "Run this in Window B (Frontend):" -ForegroundColor Gray
Write-Host "cd core\frontend" -ForegroundColor White
Write-Host "npm run dev" -ForegroundColor White

# Step 4: Testing
Write-Host "`n🧪 Step 4: Run Tests (Use Window C after migration)" -ForegroundColor Yellow
Write-Host "Basic functionality test:" -ForegroundColor Gray
Write-Host ".\testing\test_postgresql_storage.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Quota enforcement test:" -ForegroundColor Gray
Write-Host ".\testing\test_quota_enforcement.ps1" -ForegroundColor White

# Implementation Summary
Write-Host "`n📋 Implementation Summary" -ForegroundColor Cyan
Write-Host "✅ Modified Files:" -ForegroundColor Green
Write-Host "  📁 core/backend/models.py - Updated File model for BYTEA storage" -ForegroundColor Gray
Write-Host "  📁 core/backend/routes/files.py - Complete rewrite with quota enforcement" -ForegroundColor Gray
Write-Host "  📁 core/backend/config.py - Updated database credentials" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ New Files:" -ForegroundColor Green
Write-Host "  📁 core/backend/migrations/20251026_create_files_table.sql - PostgreSQL schema" -ForegroundColor Gray
Write-Host "  📁 operations/scripts/run-migration.ps1 - Migration automation" -ForegroundColor Gray
Write-Host "  📁 testing/test_postgresql_storage.ps1 - Functionality tests" -ForegroundColor Gray
Write-Host "  📁 testing/test_quota_enforcement.ps1 - Quota limit tests" -ForegroundColor Gray
Write-Host "  📁 docs/implementation/POSTGRESQL_BYTEA_IMPLEMENTATION.md - Full documentation" -ForegroundColor Gray

Write-Host "`n🔐 Security Features" -ForegroundColor Cyan
Write-Host "✅ Client-side encryption (AES-256-GCM)" -ForegroundColor Green
Write-Host "✅ Server never receives plaintext" -ForegroundColor Green
Write-Host "✅ BYTEA storage in PostgreSQL" -ForegroundColor Green
Write-Host "✅ 600MB per-user quota enforcement" -ForegroundColor Green
Write-Host "✅ HTTP 413 for quota exceeded" -ForegroundColor Green
Write-Host "✅ Safe logging (no plaintext/keys)" -ForegroundColor Green

Write-Host "`n📊 Database Configuration" -ForegroundColor Cyan
Write-Host "Database: cryptovault_db" -ForegroundColor Gray
Write-Host "User: postgres" -ForegroundColor Gray  
Write-Host "Password: sql123" -ForegroundColor Gray
Write-Host "Host: localhost:5432" -ForegroundColor Gray

Write-Host "`n🔗 API Endpoints" -ForegroundColor Cyan
Write-Host "POST /api/files/ - Upload encrypted file" -ForegroundColor Gray
Write-Host "GET /api/files/{id} - Download encrypted file" -ForegroundColor Gray
Write-Host "GET /api/files/list - List files + quota info" -ForegroundColor Gray
Write-Host "GET /api/files/quota - Check quota usage" -ForegroundColor Gray
Write-Host "DELETE /api/files/{id} - Delete file" -ForegroundColor Gray

Write-Host "`n⚡ Quick Test Commands" -ForegroundColor Cyan
Write-Host "Check database schema:" -ForegroundColor Gray
Write-Host 'psql -U postgres -d cryptovault_db -c "\d files"' -ForegroundColor White
Write-Host ""
Write-Host "Check quota function:" -ForegroundColor Gray
Write-Host "psql -U postgres -d cryptovault_db -c ""SELECT get_user_storage_usage(1);""" -ForegroundColor White

Write-Host "`n🚨 Important Notes" -ForegroundColor Red
Write-Host "1. Run each service in separate PowerShell windows" -ForegroundColor Yellow
Write-Host "2. Complete migration before starting backend" -ForegroundColor Yellow
Write-Host "3. Test user must exist before running tests" -ForegroundColor Yellow
Write-Host "4. Frontend encryption must be implemented to work with new API" -ForegroundColor Yellow

Write-Host "`n📚 Documentation" -ForegroundColor Cyan
Write-Host "Complete implementation guide:" -ForegroundColor Gray
Write-Host "docs\implementation\POSTGRESQL_BYTEA_IMPLEMENTATION.md" -ForegroundColor White

Write-Host "`n=== Ready to start! Follow the steps above ===" -ForegroundColor Green