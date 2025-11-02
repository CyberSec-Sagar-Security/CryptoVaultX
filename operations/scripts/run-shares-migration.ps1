# Run Shares Table Migration
# This script applies the shares table migration to the CryptoVault database

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CryptoVault Shares Table Migration   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "cryptovault_db"
$DB_USER = "cryptovault_user"
$MIGRATION_FILE = "core/backend/migrations/20251027_create_shares_table.sql"

Write-Host "📋 Migration Details:" -ForegroundColor Yellow
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host "   User: $DB_USER" -ForegroundColor Gray
Write-Host "   Migration: $MIGRATION_FILE" -ForegroundColor Gray
Write-Host ""

# Check if migration file exists
if (-not (Test-Path $MIGRATION_FILE)) {
    Write-Host "❌ ERROR: Migration file not found at $MIGRATION_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Migration file found" -ForegroundColor Green
Write-Host ""

# Confirm before proceeding
$confirmation = Read-Host "Do you want to apply this migration? (y/n)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
    Write-Host "❌ Migration cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "🚀 Applying migration..." -ForegroundColor Cyan
Write-Host ""

# Set PGPASSWORD environment variable
$env:PGPASSWORD = "sql123"

try {
    # Run the migration
    $psqlPath = "psql"
    
    # Try to find psql in common locations
    $possiblePaths = @(
        "C:\Program Files\PostgreSQL\16\bin\psql.exe",
        "C:\Program Files\PostgreSQL\15\bin\psql.exe",
        "C:\Program Files\PostgreSQL\14\bin\psql.exe",
        "psql"  # Try PATH
    )
    
    $psqlFound = $false
    foreach ($path in $possiblePaths) {
        if (Test-Path $path -ErrorAction SilentlyContinue) {
            $psqlPath = $path
            $psqlFound = $true
            break
        }
    }
    
    if (-not $psqlFound -and (Get-Command psql -ErrorAction SilentlyContinue)) {
        $psqlPath = "psql"
        $psqlFound = $true
    }
    
    if (-not $psqlFound) {
        Write-Host "❌ ERROR: psql command not found" -ForegroundColor Red
        Write-Host "Please ensure PostgreSQL is installed and psql is in your PATH" -ForegroundColor Yellow
        exit 1
    }
    
    # Execute migration
    & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "✅ Migration applied successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Verifying migration..." -ForegroundColor Cyan
        
        # Verify the table was created
        $verifyQuery = "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'shares';"
        $result = & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c $verifyQuery
        
        if ($result -and $result.Trim() -eq "1") {
            Write-Host "✅ Shares table exists" -ForegroundColor Green
            
            # Show table structure
            Write-Host ""
            Write-Host "📋 Table Structure:" -ForegroundColor Cyan
            & $psqlPath -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\d shares"
            
            Write-Host ""
            Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
            Write-Host "   1. Restart the backend server" -ForegroundColor Gray
            Write-Host "   2. Test the sharing API endpoints" -ForegroundColor Gray
            Write-Host "   3. Integrate Share Modal in Dashboard" -ForegroundColor Gray
            Write-Host "   4. Test end-to-end file sharing" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  WARNING: Could not verify table creation" -ForegroundColor Yellow
        }
    } else {
        Write-Host ""
        Write-Host "❌ ERROR: Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Migration failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
} finally {
    # Clear password from environment
    $env:PGPASSWORD = ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migration Process Complete           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
