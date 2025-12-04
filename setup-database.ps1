# ROSAgo Database Setup Script
# Run this once to set up PostgreSQL for the project

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ROSAgo Database Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Prompt for PostgreSQL password
Write-Host "
Enter your PostgreSQL 'postgres' user password:" -ForegroundColor Yellow
$pgPassword = Read-Host -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set environment variable for psql
$env:PGPASSWORD = $plainPassword

Write-Host "
[1/4] Testing PostgreSQL connection..." -ForegroundColor Yellow
$testResult = psql -h localhost -p 5432 -U postgres -c "SELECT 1" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Cannot connect to PostgreSQL. Please check:" -ForegroundColor Red
    Write-Host "  1. PostgreSQL is installed" -ForegroundColor Red
    Write-Host "  2. PostgreSQL service is running" -ForegroundColor Red
    Write-Host "  3. Password is correct" -ForegroundColor Red
    exit 1
}
Write-Host "OK: PostgreSQL connection successful" -ForegroundColor Green

Write-Host "
[2/4] Creating database 'rosago_dev'..." -ForegroundColor Yellow
psql -h localhost -p 5432 -U postgres -c "DROP DATABASE IF EXISTS rosago_dev;" 2>&1 | Out-Null
psql -h localhost -p 5432 -U postgres -c "CREATE DATABASE rosago_dev;" 2>&1
Write-Host "OK: Database created" -ForegroundColor Green

Write-Host "
[3/4] Updating .env file..." -ForegroundColor Yellow
$envPath = "c:\Users\user\Desktop\qoder ROSAgo\rosago\backend\.env"
$envContent = Get-Content $envPath
$newEnvContent = $envContent -replace 'DATABASE_URL=.*', "DATABASE_URL=postgresql://postgres:$plainPassword@localhost:5432/rosago_dev"
$newEnvContent | Set-Content $envPath
Write-Host "OK: .env updated with correct credentials" -ForegroundColor Green

Write-Host "
[4/4] Running Prisma migrations..." -ForegroundColor Yellow
cd "c:\Users\user\Desktop\qoder ROSAgo\rosago\backend"
npx prisma migrate deploy
npx prisma generate
Write-Host "OK: Database schema set up" -ForegroundColor Green

Write-Host "
========================================" -ForegroundColor Cyan
Write-Host "Database setup complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "
You can now run: .\start-backend.ps1" -ForegroundColor Cyan

# Clear password from memory
$env:PGPASSWORD = ""
