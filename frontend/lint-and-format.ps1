#!/usr/bin/env pwsh

# PowerShell script to run linting and formatting
Set-Location "frontend"

Write-Host "Running ESLint..." -ForegroundColor Green
npm run lint:fix

Write-Host "Running Prettier..." -ForegroundColor Green
npm run format

Write-Host "Code quality checks completed!" -ForegroundColor Green
