# GPS Tracking System - End-to-End Testing Guide

## ✅ System Status (as of Dec 7, 2025)

**What's Working:**
- ✅ Backend running on http://192.168.100.8:3000
- ✅ Admin Web Dashboard on http://localhost:3001
- ✅ Database seeded with test data
- ✅ 24/7 active test route created
- ✅ Trip status set to IN_PROGRESS
- ✅ WebSocket authentication implemented
- ✅ Orange beeping bus icon added to map
- ✅ Enhanced GPS debugging logs

**Recent Fixes:**
- Fixed WebSocket authentication (JWT tokens now included)
- Changed trip status from SCHEDULED to IN_PROGRESS
- Driver auto-joins bus room when GPS starts
- Real attendance data displayed from backend

---

## 📋 Test Credentials

### Admin Dashboard
- **Email:** admin@saferide.com
- **Password:** Test@1234
- **URL:** http://localhost:3001

### Driver App (Mobile)
- **Email:** driver@saferide.com
- **Password:** Test@1234

### Parent App (Mobile)
- **Email:** parent@test.com
- **Password:** Test@1234

---

## 🧪 Step-by-Step Testing Procedure

### Step 1: Start Backend (Already Running ✅)
Backend is running in watch mode with hot reload enabled.

**Check backend logs for:**
```
Application is running on: http://0.0.0.0:3000
```

### Step 2: Start Admin Dashboard
```powershell
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\admin-web'
npm run dev
```

**Access:** http://localhost:3001

### Step 3: Login to Admin Dashboard
1. Navigate to http://localhost:3001
2. Login with: admin@saferide.com / Test@1234
3. Click "Live Dashboard" from sidebar
4. **Expected state:**
   - Active Trips: **1**
   - Buses Tracking: **0** (until driver starts GPS)
   - Connection: **🟢 Live** (WebSocket connected)

### Step 4: Start Driver App
```powershell
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\frontend'
npm start
```

**Expo will start** - scan QR code with Expo Go app on your phone.

### Step 5: Test Driver GPS Tracking

1. **Login to Driver App:**
   - Email: driver@saferide.com
   - Password: Test@1234

2. **Expected on Driver Home Screen:**
   - Today's Trip: "Osu - Greenfield Route"
   - Total Children: 2
   - Picked: 2 (already picked up in seed data)
   - GPS Tracking toggle: OFF (⚪ Tracking inactive)

3. **Enable GPS Tracking:**
   - Toggle the GPS switch ON
   - Grant location permissions when prompted
   - Alert should show: "Location tracking started for bus [bus-id]"
   - Status should change to: "🟢 Tracking active"

4. **Check Driver App Console Logs:**
   ```
   [DriverHome] Socket connected: [socket-id]
   [DriverHome] Joining bus room: [bus-id]
   [GPS] Starting location tracking...
   [GPS] Emitted location: {latitude: X, longitude: Y, ...}
   ```

### Step 6: Verify Backend Receives GPS Data

**Backend terminal should show:**
```
Client connected: [socket-id], User: [user-id]
[Socket] Client [id] joined bus room: bus:[bus-id]
[Socket] Total clients in bus:[bus-id]: 1
[GPS Update] Bus: [bus-id], User: [user-id], Lat: X, Lng: Y
[GPS Update] Broadcasting to X clients in room bus:[bus-id]
[GPS Update] Broadcasted location data for bus [bus-id]
```

**Logs repeat every 5 seconds** (GPS update interval).

### Step 7: Check Admin Dashboard

1. **Refresh the Live Dashboard page**
2. **Expected Changes:**
   - Active Trips: **1** ✅
   - Buses Tracking: **1** ✅ (was 0 before)
   - Map shows **orange beeping bus icon** 🟠🚌
   - Bus location updates in real-time
   - Right panel shows: "🚌 GR-2024-001" with green dot (📍 GPS coordinates)

3. **Open Browser Console (F12):**
   ```
   [Socket] Connected
   [Socket] Bus location: {busId: "...", latitude: X, longitude: Y, ...}
   [Socket] Updated bus locations: {...}
   ```

4. **Test Bus Selection:**
   - Click on the bus in the right panel
   - Map should zoom to bus location
   - Bus marker gets gold border (selected state)
   - Bottom panel shows detailed coordinates

### Step 8: Test Parent Live Tracking

1. **Login to Parent App:**
   - Email: parent@test.com
   - Password: Test@1234

2. **Navigate to "Live Tracking" tab**

3. **Expected:**
   - Map shows bus location
   - Bus icon moves in real-time
   - ETA and Distance calculated
   - Route: "Route A - Morning"
   - Status: "Active"

---

## 🐛 Troubleshooting

### Issue: Buses Tracking shows 0

**Possible Causes:**
1. Driver hasn't enabled GPS
2. WebSocket not authenticated
3. Driver not joining bus room

**Debug Steps:**
```powershell
# Check backend logs
# Should see:
# - "Client connected"
# - "[Socket] Client [id] joined bus room"
# - "[GPS Update] Broadcasting to X clients"
```

**Fix:**
- Make sure driver logged in AFTER backend restart
- Check driver app console for socket connection logs
- Verify backend shows "Client connected" log

### Issue: Map doesn't show bus icon

**Possible Causes:**
1. No GPS data received yet
2. Admin not joined bus room
3. Socket not connected

**Debug Steps:**
```javascript
// Open browser console on admin dashboard
// Check for:
// [Socket] Connected
// [Socket] Bus location: {...}
```

**Fix:**
- Refresh admin dashboard page
- Wait 5 seconds for GPS update
- Check backend logs for GPS broadcasts

### Issue: GPS not emitting

**Check Driver App:**
```
[GPS] Starting location tracking...
[GPS] Emitted location: {...}
```

**If missing:**
- Check location permissions
- Verify socket is connected
- Restart driver app and login fresh

---

## 📊 Expected Data Flow

```
Driver App (GPS ON)
    ↓
Socket.IO emit 'gps_update' with {busId, lat, lng}
    ↓
Backend RealtimeGateway receives
    ↓
Backend broadcasts to room 'bus:[busId]'
    ↓
Admin Dashboard receives 'bus_location' event
    ↓
Map updates with new coordinates
    ↓
Orange bus icon moves on map 🟠🚌
```

---

## 🎯 Success Criteria

✅ **Driver App:**
- GPS toggle works
- Shows "🟢 Tracking active"
- Console logs GPS emissions every 5 seconds

✅ **Backend:**
- Logs show client connected
- Logs show bus room joined
- Logs show GPS broadcasts

✅ **Admin Dashboard:**
- Buses Tracking: 1
- Orange bus icon visible on map
- Icon pulses/beeps (animated)
- Real-time updates every 5 seconds

✅ **Parent App:**
- Map shows bus location
- Bus moves in real-time
- ETA/Distance displayed

---

## 🔧 Quick Commands

### Restart Backend
```powershell
# Stop backend (Ctrl+C in terminal)
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\backend'
npm run start:dev
```

### Restart Admin Web
```powershell
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\admin-web'
npm run dev
```

### Restart Frontend (Driver/Parent App)
```powershell
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\frontend'
npm start
```

### Re-seed Database (if needed)
```powershell
cd 'c:\Users\user\Desktop\qoder ROSAgo\rosago\backend'
npm run seed
```

**Note:** After re-seeding, you MUST logout and login again on all apps (new user IDs are created).

---

## 📝 Current Trip Details (from seed)

- **Trip ID:** Generated on seed
- **Bus:** GR-2024-001 (Capacity: 30)
- **Route:** Osu - Greenfield Route
- **Driver:** John Driver (driver@saferide.com)
- **Status:** IN_PROGRESS
- **Children:** 2 (Akosua, Kwabena - both PICKED_UP)
- **Scheduled:** 24/7 (active all days for testing)

---

## 🎨 UI Features

### Map
- **Style:** MapTiler Streets (Day theme)
- **View:** 3D with 45° pitch
- **Bus Icon:** 🚌 Orange gradient with pulse animation
- **Pulse:** 1.5s cycle (beeping effect)
- **Label:** Bus plate number below icon
- **Selected:** Gold border around icon

### Stats Cards
- **Active Trips:** Count of IN_PROGRESS trips
- **Buses Tracking:** Count of buses with active GPS
- **Connection:** Live (green) or Polling (red)
- **Last Update:** Auto-refresh timestamp

---

## 🚀 Next Steps After Testing

1. **If GPS works:** Move to payment integration
2. **If issues found:** Debug using logs above
3. **Document any bugs:** Note in GitHub issues
4. **Test on real device:** Verify actual GPS coordinates

---

**Last Updated:** December 7, 2025
**System Status:** ✅ Ready for testing
**Backend:** Running with enhanced logging
**WebSocket:** Authenticated with JWT
