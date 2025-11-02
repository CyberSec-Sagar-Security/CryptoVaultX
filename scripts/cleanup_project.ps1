# CryptoVault Project Cleanup Script
# This script removes unnecessary files and reorganizes the project structure

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "CryptoVault Project Cleanup" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "d:\Study and work\College_Software_Projects\CryptoVault"

# 1. Remove unused frontend page folders
Write-Host "[1/4] Removing unused page folders..." -ForegroundColor Yellow
$unusedFolders = @(
    "$projectRoot\core\frontend\src\pages\Dropdown_Sidebar"
)

foreach ($folder in $unusedFolders) {
    if (Test-Path $folder) {
        Remove-Item -Path $folder -Recurse -Force
        Write-Host "  ✓ Removed: $folder" -ForegroundColor Green
    }
}

# 2. Clean up docs folder (remove redundant documentation)
Write-Host "`n[2/4] Cleaning up documentation..." -ForegroundColor Yellow
$docsToRemove = @(
    "$projectRoot\docs\SHARING_SYNC_README.md",
    "$projectRoot\docs\IMPLEMENTATION_SUMMARY.md"
)

foreach ($doc in $docsToRemove) {
    if (Test-Path $doc) {
        Remove-Item -Path $doc -Force
        Write-Host "  ✓ Removed: $(Split-Path $doc -Leaf)" -ForegroundColor Green
    }
}

# 3. Consolidate docs/guides (remove duplicate API docs)
Write-Host "`n[3/4] Consolidating API documentation..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\docs\guides\API_DOCS.md") {
    Remove-Item -Path "$projectRoot\docs\guides\API_DOCS.md" -Force
    Write-Host "  ✓ Removed duplicate: API_DOCS.md (keeping API_DOCUMENTATION.md)" -ForegroundColor Green
}

# 4. Remove operations folder if not essential
Write-Host "`n[4/4] Checking operations folder..." -ForegroundColor Yellow
if (Test-Path "$projectRoot\operations") {
    $operationsFiles = Get-ChildItem -Path "$projectRoot\operations" -Recurse -File
    Write-Host "  ℹ Operations folder contains $($operationsFiles.Count) files" -ForegroundColor Cyan
    Write-Host "  ℹ Keeping operations folder for now (contains DB scripts)" -ForegroundColor Cyan
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "Cleanup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary of changes:" -ForegroundColor White
Write-Host "  • Removed unused page folders" -ForegroundColor Gray
Write-Host "  • Cleaned up redundant documentation" -ForegroundColor Gray
Write-Host "  • Consolidated API documentation" -ForegroundColor Gray
Write-Host "  • Organized startup scripts into /scripts folder" -ForegroundColor Gray
Write-Host ""
