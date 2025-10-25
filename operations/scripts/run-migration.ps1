# PowerShell script to run PostgreSQL migration for CryptoVault file storage
# This script applies the migration to create the files table with BYTEA storage

Write-Host "=== CryptoVault PostgreSQL Migration ===" -ForegroundColor Green

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "cryptovault_db"
$DB_USER = "postgres"  # Adjust if different
$MIGRATION_FILE = "migrations/20251026_create_files_table.sql"

Write-Host "`nMigration Configuration:" -ForegroundColor Yellow
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  Host: $DB_HOST:$DB_PORT" -ForegroundColor Gray
Write-Host "  User: $DB_USER" -ForegroundColor Gray
Write-Host "  Migration: $MIGRATION_FILE" -ForegroundColor Gray

# Check if migration file exists
$migrationPath = Join-Path $PSScriptRoot "..\core\backend\$MIGRATION_FILE"
if (-not (Test-Path $migrationPath)) {
    Write-Host "❌ Migration file not found: $migrationPath" -ForegroundColor Red
    Write-Host "   Please ensure you're running this script from the correct directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Migration file found: $migrationPath" -ForegroundColor Green

# Check if psql is available
try {
    $psqlVersion = psql --version 2>$null
    Write-Host "✅ PostgreSQL client found: $psqlVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ psql command not found" -ForegroundColor Red
    Write-Host "   Please install PostgreSQL client tools or add them to PATH" -ForegroundColor Yellow
    Write-Host "   Download from: https://www.postgresql.org/download/" -ForegroundColor Cyan
    exit 1
}

# Prompt for password
Write-Host "`nEnter PostgreSQL password for user '$DB_USER':" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$env:PGPASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

# Test database connection
Write-Host "`nTesting database connection..." -ForegroundColor Yellow
try {
    $connectionTest = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        Write-Host "   Error: $connectionTest" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Failed to connect to database" -ForegroundColor Red
    Write-Host "   Please check database is running and credentials are correct" -ForegroundColor Yellow
    exit 1
}

# Backup existing files table (if it exists)
Write-Host "`nBacking up existing data..." -ForegroundColor Yellow
try {
    $backupFile = "files_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    $backupPath = Join-Path $PSScriptRoot $backupFile
    
    # Check if files table exists
    $tableExists = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'files');" -t 2>$null
    
    if ($tableExists -and $tableExists.Trim() -eq "t") {
        Write-Host "   Files table exists, creating backup..." -ForegroundColor Gray
        pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t files --data-only > $backupPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backup created: $backupPath" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Backup failed, but continuing with migration" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   No existing files table found" -ForegroundColor Gray
    }
}
catch {
    Write-Host "⚠️  Backup step failed, but continuing with migration" -ForegroundColor Yellow
}

# Run the migration
Write-Host "`nRunning migration..." -ForegroundColor Yellow
try {
    $migrationResult = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $migrationPath 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
        Write-Host "`nMigration output:" -ForegroundColor Gray
        $migrationResult | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "❌ Migration failed" -ForegroundColor Red
        Write-Host "   Error output:" -ForegroundColor Red
        $migrationResult | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
        exit 1
    }
}
catch {
    Write-Host "❌ Migration execution failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify migration
Write-Host "`nVerifying migration..." -ForegroundColor Yellow
try {
    # Check if new table structure exists
    $tableStructure = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d files" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ New files table structure verified" -ForegroundColor Green
        Write-Host "`nTable structure:" -ForegroundColor Gray
        $tableStructure | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "❌ Table verification failed" -ForegroundColor Red
        exit 1
    }
    
    # Check if functions were created
    $functionsCheck = psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%storage%';" -t 2>$null
    
    if ($functionsCheck -and $functionsCheck.Trim() -ne "") {
        Write-Host "✅ Storage functions created successfully" -ForegroundColor Green
        $functionsCheck.Split("`n") | Where-Object { $_.Trim() -ne "" } | ForEach-Object { 
            Write-Host "   Function: $($_.Trim())" -ForegroundColor Gray 
        }
    }
}
catch {
    Write-Host "⚠️  Verification step failed, but migration may have succeeded" -ForegroundColor Yellow
}

# Clean up environment variable
$env:PGPASSWORD = $null

Write-Host "`n=== Migration Complete ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start the backend: cd core\backend && python app.py" -ForegroundColor White
Write-Host "2. Test the implementation: .\testing\test_postgresql_storage.ps1" -ForegroundColor White
Write-Host "3. Test quota enforcement: .\testing\test_quota_enforcement.ps1" -ForegroundColor White
Write-Host "`nNew features available:" -ForegroundColor Cyan
Write-Host "✓ Encrypted files stored directly in PostgreSQL BYTEA" -ForegroundColor White
Write-Host "✓ 600MB per-user quota enforcement" -ForegroundColor White
Write-Host "✓ Server never receives plaintext (client-side encryption)" -ForegroundColor White
Write-Host "✓ HTTP 413 responses for quota exceeded" -ForegroundColor White