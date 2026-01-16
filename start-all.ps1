# SafeRide - Start All Services
# Starts Backend (port 3000), Admin Dashboard (port 3001), and Frontend (Expo with QR code)

Write-Host "🚀 Starting SafeRide System..." -ForegroundColor Yellow

# Start Backend
Write-Host "`n📡 Starting Backend (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run start:dev"

# Wait 3 seconds for backend to initialize
Start-Sleep -Seconds 3

# Start Admin Dashboard
Write-Host "`n🖥️  Starting Admin Dashboard (port 3001)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\admin-web'; npm run dev"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start Frontend with QR code
Write-Host "`n📱 Starting Frontend (Expo with QR)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npx expo start --clear"

Write-Host "`n✅ All services starting!" -ForegroundColor Green
Write-Host "`nAccess URLs:" -ForegroundColor Yellow
Write-Host "  Backend API:     http://localhost:3000" -ForegroundColor White
Write-Host "  Admin Dashboard: http://localhost:3001" -ForegroundColor White
Write-Host "  Frontend:        Scan QR code in Expo Go app" -ForegroundColor White
Write-Host "`nScript Location: $PSScriptRoot\start-all.ps1" -ForegroundColor Gray
Write-Host "Press Ctrl+C in each terminal to stop services.`n" -ForegroundColor Gray
