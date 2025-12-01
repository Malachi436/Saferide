# ROSAgo Setup Complete ✅

## Summary
Your backend is now running locally with a dedicated PostgreSQL instance on port 55432, avoiding conflicts with your existing Windows PostgreSQL service.

## What We Did

### 1. Created Dedicated PostgreSQL Instance
- **Location**: `C:\Users\user\rosago_pgdata`
- **Port**: 55432 (no conflict with existing service on 5432)
- **Admin Password**: rosago_admin_pass
- **Database**: rosago_dev
- **User**: rosago / rosago_password

### 2. Backend Configuration
- ✅ Database URL: `postgresql://rosago:rosago_password@localhost:55432/rosago_dev`
- ✅ Redis URL: `redis://localhost:6379`
- ✅ JWT secrets configured
- ✅ Prisma client generated
- ✅ Migrations applied
- ✅ Database seeded with test data

### 3. Backend Running
- **Status**: ✅ Running on http://0.0.0.0:3000
- **Process**: Background (npm run start:dev)
- **Logs**: Available in terminal

### 4. Frontend Configuration
- **API Base URL**: http://192.168.100.15:3000
- **Token Storage**: AsyncStorage (access_token, refresh_token)
- **New Feature**: "Clear Cache & Re-login" button in Settings

## Test Credentials

Login with these credentials:

### Parent Account
- **Email**: parent@test.com
- **Password**: Test@1234
- **User ID**: 3aa3d89e-c3d3-4167-90e2-58dbe842703f

### Driver Account
- **Email**: driver@saferide.com
- **Password**: Test@1234

### Admin Account
- **Email**: admin@saferide.com
- **Password**: Test@1234

## How to Fix 401 Errors

The 401 errors you're seeing are because old/invalid tokens are stored. Follow these steps:

### Option 1: Use the Clear Cache Button (Recommended)
1. Open the frontend app
2. Navigate to **Settings** tab
3. Scroll to the bottom
4. Tap **"Clear Cache & Re-login"** (yellow button)
5. Confirm the action
6. You'll be logged out automatically
7. Log in again with: **parent@test.com** / **Test@1234**

### Option 2: Fresh App Start
1. Close the Expo app completely
2. Clear the app data (or reinstall)
3. Start fresh and log in with the test credentials

## Next Steps

1. **Start Frontend** (if not already running):
   ```bash
   cd frontend
   npm start
   ```

2. **Open Simulator/Device**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code for physical device

3. **Clear Cache & Login**:
   - Use the "Clear Cache & Re-login" button in Settings
   - Login with: parent@test.com / Test@1234

4. **Test Features**:
   - View children on home screen
   - Check notifications
   - Track live location
   - All endpoints should work now

## Restart Instructions

If you restart your PC:

### Start PostgreSQL (Port 55432)
```powershell
& "C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe" -D C:\Users\user\rosago_pgdata -l C:\Users\user\rosago_pgdata\logfile.txt -o "-p 55432" start
```

### Start Backend
```powershell
cd backend
npm run start:dev
```

### Start Frontend
```powershell
cd frontend
npm start
```

## Verify Backend is Working

Test login endpoint:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/auth/login -Method POST -ContentType "application/json" -Body '{"email":"parent@test.com","password":"Test@1234"}' | Select-Object -ExpandProperty Content
```

Expected: JSON response with `access_token`, `refresh_token`, `userId`, and `user` object.

## Troubleshooting

### Backend not starting?
- Check PostgreSQL is running: `Test-NetConnection -ComputerName localhost -Port 55432`
- Check Redis is running: `Test-NetConnection -ComputerName localhost -Port 6379`
- Check backend terminal for errors

### Frontend ERR_NETWORK?
- Ensure backend is running on port 3000
- Check your computer's IP: `ipconfig` (should match 192.168.100.15)
- Try http://localhost:3000 if using Android emulator

### Still getting 401?
- Use "Clear Cache & Re-login" button
- Verify you're using the correct test credentials
- Check backend logs for JWT errors
- Confirm fresh tokens are being saved

## Files Modified

1. `backend/.env` - Updated DATABASE_URL to port 55432
2. `frontend/src/screens/parent/SettingsScreen.tsx` - Added "Clear Cache & Re-login" button
3. PostgreSQL data directory created at `C:\Users\user\rosago_pgdata`

## Success!

Your ROSAgo system is fully configured and ready to test. The 401 errors will disappear once you clear the old tokens and log in fresh with the test credentials.
