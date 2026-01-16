# GPS Tracking System - Complete Implementation & Troubleshooting Guide

## System Architecture Overview

### The Complete Data Flow
```
Driver App (React Native)
  └─> GPS Location Updates (every 5s)
      └─> Socket.IO emit('gps_update') 
          └─> Backend RealtimeGateway
              ├─> Store in Redis (TTL 5min)
              ├─> Save to PostgreSQL (every 5th heartbeat)
              └─> Broadcast via Socket.IO
                  ├─> emit('bus_location') to room `bus:{busId}`
                  └─> emit('new_location_update') to all clients
                      
Admin Dashboard (Next.js)
  ├─> WebSocket connects with JWT token
  ├─> emit('join_company_room', { companyId })
  └─> listen('bus_location') + listen('new_location_update')
      └─> Update map markers in real-time
      
REST Fallback (if WebSocket fails)
  └─> GET /gps/location/:busId (fetches from Redis)
```

---

## ISSUE 1: Connection Status Shows "Polling" Instead of "Live"

### Root Causes
1. **WebSocket authentication failing** - Backend disconnects client immediately
2. **CORS issues** - Frontend can't establish WebSocket connection
3. **Wrong Socket URL** - Frontend connecting to wrong backend address
4. **Missing JWT token** - localStorage token not found or expired
5. **Socket.IO version mismatch** - Client and server using incompatible versions

### Diagnostic Steps

#### Step 1: Check Frontend Socket URL
**File:** `admin-web/.env.local`
```bash
# Current value in your system
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

# If backend runs on different IP, change to:
NEXT_PUBLIC_SOCKET_URL=http://172.20.10.3:3000
```

**Verify in code:**
```typescript
// admin-web/src/hooks/useSocket.ts (line 6)
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://192.168.100.2:3000';
```

**Fix if needed:** Update `.env.local` to match your backend IP address.

---

#### Step 2: Verify Backend is Running
```powershell
# Check if backend is accessible
curl http://localhost:3000/health

# Or check WebSocket port
netstat -ano | findstr :3000
```

**Expected:** Backend should respond with health status.

---

#### Step 3: Check Browser Console Logs
**Open Admin Dashboard** → Press F12 → Console tab

**Look for:**
```javascript
// GOOD SIGNS:
[Socket] Connecting to: http://localhost:3000
[Socket] Connected: abc123xyz
[Socket] Joined company room: company-id-here

// BAD SIGNS:
[Socket] Connection error: Unauthorized
[Socket] Disconnected: transport close
[Socket] Connection error: Invalid namespace
```

**If you see "Unauthorized":**
```javascript
// Check localStorage has token
console.log(localStorage.getItem('token'));
// Should output: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**If token is null:** You're not logged in properly. Login again.

**If token exists but still unauthorized:** Token might be expired or invalid.

---

#### Step 4: Check Backend Logs
**Backend console should show:**
```
Client connected: socketId, User: userId
[Socket] Client socketId joined company room: companyId
```

**If you see:**
```
WebSocket authentication error: JsonWebTokenError
Client disconnected immediately
```

**Problem:** JWT token verification failing.

**Fix:** Check backend JWT secret matches what was used to sign the token:
```bash
# backend/.env
JWT_ACCESS_SECRET=your-secret-here
```

---

### Solution Checklist

- [ ] **Verify Socket URL matches backend address**
  ```bash
  # admin-web/.env.local
  NEXT_PUBLIC_SOCKET_URL=http://YOUR_BACKEND_IP:3000
  ```

- [ ] **Check Socket.IO versions match**
  ```bash
  # Check versions
  cat admin-web/package.json | grep socket.io-client
  cat backend/package.json | grep socket.io
  # Both should be 4.8.1
  ```

- [ ] **Verify CORS is enabled on backend**
  ```typescript
  // backend/src/modules/realtime/realtime.gateway.ts (line 8-10)
  @WebSocketGateway({
    cors: { origin: '*' },  // Should allow all origins
    transports: ['websocket', 'polling']
  })
  ```

- [ ] **Test WebSocket connection manually**
  ```javascript
  // Run in browser console while on admin dashboard
  const socket = io('http://localhost:3000', {
    auth: { token: localStorage.getItem('token') }
  });
  socket.on('connect', () => console.log('CONNECTED!'));
  socket.on('connect_error', (err) => console.error('ERROR:', err.message));
  ```

---

## ISSUE 2: Bus Location Not Appearing on Map

### Root Causes
1. **No GPS data being sent** - Driver hasn't started GPS tracking
2. **Wrong event names** - Frontend listening for different event than backend emits
3. **Not joined bus room** - Dashboard not subscribed to bus updates
4. **Redis not storing data** - Redis connection failure
5. **Children coordinates missing** - homeLatitude/homeLongitude are null

### Diagnostic Steps

#### Step 1: Verify Driver is Sending GPS Updates

**Check driver app logs:**
```
[GPS] Starting location tracking...
[GPS] Emitted to server for bus: bus-id-here
```

**If missing:** Driver hasn't turned on GPS or hasn't started trip.

---

#### Step 2: Verify Backend Receives GPS Updates

**Backend logs should show:**
```
[GPS Update] Received from client: socketId, Bus: busId
[GPS Update] Stored in Redis for bus busId
[GPS Update] Broadcasting to X clients in room bus:busId
```

**If missing:** Driver's GPS updates not reaching backend.

**Check:**
- Is driver socket connected?
- Is driver sending to correct busId?
- Is driver authenticated?

---

#### Step 3: Check Redis is Storing Location

**Connect to Redis CLI:**
```powershell
cd "C:\Redis-7.4.1\Redis-7.4.1-Windows-x64-msys2"
.\redis-cli.exe

# Check if bus location is cached
GET bus:{your-bus-id}:location
# Should return: {"busId":"...","latitude":...,"longitude":...}
```

**If returns (nil):** Redis not storing data.

**Check Redis connection:**
```bash
# backend/.env
REDIS_URL=redis://localhost:6379
```

**Test Redis:**
```powershell
.\redis-cli.exe PING
# Should return: PONG
```

---

#### Step 4: Verify Event Names Match

**Backend emits (realtime.gateway.ts line 195, 198):**
```typescript
this.server.to(`bus:${data.busId}`).emit('bus_location', locationData);
this.server.emit('new_location_update', locationData);
```

**Frontend listens (useSocket.ts line 71, 85):**
```typescript
socket.on('bus_location', (data) => { ... });
socket.on('new_location_update', (data) => { ... });
```

**✅ These match!** No issue here.

---

#### Step 5: Check Frontend Receives Events

**Add debug logs to `useSocket.ts` (line 71):**
```typescript
socketRef.current.on('bus_location', (data: BusLocation) => {
  console.log('[Socket] *** BUS_LOCATION EVENT RECEIVED ***');
  console.log('[Socket] Bus location data:', JSON.stringify(data));
  // ... rest of handler
});
```

**Open browser console while GPS is active.**

**If you see logs:** WebSocket is working! Check map rendering.

**If no logs:** WebSocket not receiving events.

---

### Solution: Force Test GPS Data

**Method 1: Send GPS via REST endpoint**
```powershell
# Using curl or Postman
curl -X POST http://localhost:3000/gps/heartbeat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "{
    \"busId\": \"your-bus-id\",
    \"latitude\": 0.3476,
    \"longitude\": 32.5825,
    \"speed\": 45,
    \"timestamp\": \"2026-01-16T10:30:00Z\"
  }"
```

**Method 2: Send GPS via WebSocket (Browser Console)**
```javascript
// On admin dashboard, open console
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => {
  console.log('Connected!');
  
  // Send fake GPS update
  socket.emit('gps_update', {
    busId: 'your-bus-id',
    latitude: 0.3476,
    longitude: 32.5825,
    speed: 45,
    timestamp: new Date().toISOString()
  });
  
  console.log('GPS update sent!');
});
```

**Expected:** You should see bus marker appear on map within 1 second.

---

## ISSUE 3: Children Home Locations Not Showing

### Root Cause
Children records in database missing `homeLatitude` and `homeLongitude` values.

### Diagnostic Steps

#### Step 1: Check Database Records
```sql
-- Connect to PostgreSQL
psql -U postgres -d rosago

-- Check children with coordinates
SELECT id, "firstName", "lastName", 
       "homeLatitude", "homeLongitude", "homeAddress"
FROM "Child"
WHERE "homeLatitude" IS NOT NULL;

-- Count children without coordinates
SELECT COUNT(*) FROM "Child" WHERE "homeLatitude" IS NULL;
```

**If count is high:** Children need coordinates added.

---

#### Step 2: Check API Response
```javascript
// Browser console on admin dashboard
fetch('http://localhost:3000/admin/company/YOUR_COMPANY_ID/children', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total children:', data.length);
  const withCoords = data.filter(c => c.homeLatitude && c.homeLongitude);
  console.log('Children with coordinates:', withCoords.length);
  console.log('Sample:', withCoords[0]);
});
```

**Expected:** Should show children with lat/lng values.

---

### Solution: Add Coordinates to Children

**Method 1: Update via Admin Dashboard**
- Go to Children page
- Edit each child
- Add home latitude, longitude, and address

**Method 2: Bulk Update via SQL**
```sql
-- Add coordinates to existing children (example: Kampala area)
UPDATE "Child"
SET 
  "homeLatitude" = 0.3476 + (RANDOM() * 0.01),
  "homeLongitude" = 32.5825 + (RANDOM() * 0.01),
  "homeAddress" = 'Kampala, Uganda'
WHERE "homeLatitude" IS NULL;
```

**Method 3: Update via API**
```javascript
// Batch update children with coordinates
const children = [...]; // Array of child IDs
for (const childId of children) {
  await fetch(`http://localhost:3000/children/${childId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({
      homeLatitude: 0.3476,
      homeLongitude: 32.5825,
      homeAddress: 'Kampala, Uganda'
    })
  });
}
```

---

## Complete Implementation Checklist

### Backend Setup

- [ ] **RealtimeModule registered in AppModule**
  ```typescript
  // backend/src/app.module.ts (line 69)
  imports: [
    // ...
    RealtimeModule,  // ✓ Present
  ]
  ```

- [ ] **RealtimeGateway has proper decorators**
  ```typescript
  // backend/src/modules/realtime/realtime.gateway.ts (line 7-14)
  @WebSocketGateway({
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 60000,
  })
  export class RealtimeGateway { ... }
  ```

- [ ] **GPS service stores in Redis**
  ```typescript
  // backend/src/modules/gps/gps.service.ts (line 30)
  await this.redis.setex(`bus:${busId}:location`, 300, JSON.stringify(locationData));
  ```

- [ ] **RealtimeGateway broadcasts GPS updates**
  ```typescript
  // backend/src/modules/realtime/realtime.gateway.ts (line 195, 198)
  this.server.to(`bus:${busId}`).emit('bus_location', locationData);
  this.server.emit('new_location_update', locationData);
  ```

- [ ] **JWT authentication on WebSocket**
  ```typescript
  // backend/src/modules/realtime/realtime.gateway.ts (line 47-70)
  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;
    const payload = this.jwtService.verify(token, {...});
    // ...
  }
  ```

- [ ] **Redis is running**
  ```powershell
  redis-cli.exe PING  # Should return PONG
  ```

- [ ] **Backend built with latest changes**
  ```powershell
  cd backend
  npm run build
  npm run start:dev
  ```

---

### Frontend Setup (Admin Dashboard)

- [ ] **Socket.IO client installed**
  ```bash
  cd admin-web
  npm list socket.io-client
  # Should show: socket.io-client@4.8.1
  ```

- [ ] **Environment variable set**
  ```bash
  # admin-web/.env.local
  NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
  # Change to your backend IP if different
  ```

- [ ] **useSocket hook connects with token**
  ```typescript
  // admin-web/src/hooks/useSocket.ts (line 35, 37-38)
  const token = localStorage.getItem('token');
  socketRef.current = io(SOCKET_URL, {
    auth: { token },  // ✓ Token sent
    transports: ['websocket', 'polling']
  });
  ```

- [ ] **useSocket listens for correct events**
  ```typescript
  // admin-web/src/hooks/useSocket.ts (line 71, 85)
  socket.on('bus_location', ...);         // ✓ Correct
  socket.on('new_location_update', ...);  // ✓ Correct
  ```

- [ ] **Live dashboard uses useSocket hook**
  ```typescript
  // admin-web/src/app/company/[companyId]/live-dashboard/page.tsx (line 72)
  const { connected, busLocations } = useSocket(companyId);  // ✓ Used
  ```

- [ ] **Map component receives busLocations**
  ```typescript
  // admin-web/src/app/company/[companyId]/live-dashboard/page.tsx (line 241)
  <ROSAgoMap
    busLocations={mergedLocations}  // ✓ Passed
    schools={...}
    pickups={...}
  />
  ```

---

### Mobile App Setup (Driver)

- [ ] **Socket service configured**
  ```typescript
  // frontend/src/utils/socket.ts
  const SOCKET_URL = 'http://YOUR_BACKEND_IP:3000';
  ```

- [ ] **GPS service emits to socket**
  ```typescript
  // frontend/src/services/gpsService.ts (line 80-84)
  socket.emit('gps_update', {
    busId,
    latitude, longitude, speed, heading, timestamp
  });
  ```

- [ ] **Driver connects socket when GPS starts**
  ```typescript
  // Check driver logs show:
  [GPS] Emitted to server for bus: busId
  [Socket] Connected
  ```

---

### Database Setup

- [ ] **BusLocation model exists in schema**
  ```prisma
  // backend/prisma/schema.prisma
  model BusLocation {
    id        String   @id @default(uuid())
    busId     String
    bus       Bus      @relation(fields: [busId], references: [id])
    latitude  Float
    longitude Float
    speed     Float
    timestamp DateTime @default(now())
    createdAt DateTime @default(now())
    
    @@index([busId, timestamp(desc)])
  }
  ```

- [ ] **Database migrated**
  ```powershell
  cd backend
  npx prisma migrate dev
  ```

- [ ] **Children have coordinates**
  ```sql
  SELECT COUNT(*) FROM "Child" WHERE "homeLatitude" IS NOT NULL;
  -- Should return count > 0
  ```

- [ ] **Schools have coordinates**
  ```sql
  SELECT COUNT(*) FROM "School" WHERE "latitude" IS NOT NULL;
  -- Should return count > 0
  ```

- [ ] **Buses assigned to drivers**
  ```sql
  SELECT COUNT(*) FROM "Bus" WHERE "driverId" IS NOT NULL;
  -- Should return count > 0
  ```

- [ ] **Active trips exist**
  ```sql
  SELECT COUNT(*) FROM "Trip" 
  WHERE status IN ('SCHEDULED', 'IN_PROGRESS');
  -- Should return count > 0
  ```

---

## Testing Procedure

### Test 1: WebSocket Connection
```javascript
// Run in browser console on admin dashboard
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('✅ CONNECTED! Socket ID:', socket.id);
  console.log('✅ Transport:', socket.io.engine.transport.name);
});

socket.on('connect_error', (err) => {
  console.log('❌ CONNECTION FAILED:', err.message);
});

// Wait 3 seconds, then check:
setTimeout(() => {
  console.log('Connected?', socket.connected);
  console.log('Transport:', socket.io.engine.transport.name);
  // Should show: websocket (not polling)
}, 3000);
```

**Expected Result:** 
```
✅ CONNECTED! Socket ID: abc123
✅ Transport: websocket
Connected? true
Transport: websocket
```

---

### Test 2: Join Company Room
```javascript
// After Test 1 passes:
socket.emit('join_company_room', { companyId: 'YOUR_COMPANY_ID' });
console.log('✅ Joined company room');

// Check backend logs should show:
// [Socket] Client abc123 joined company room: YOUR_COMPANY_ID
```

---

### Test 3: Send Fake GPS Update
```javascript
// After Test 2 passes:
const testBusId = 'YOUR_BUS_ID'; // Get from database

socket.emit('gps_update', {
  busId: testBusId,
  latitude: 0.3476,   // Kampala coordinates
  longitude: 32.5825,
  speed: 45,
  heading: 180,
  timestamp: new Date().toISOString()
});

console.log('✅ GPS update sent for bus:', testBusId);

// Backend should log:
// [GPS Update] Received from client: abc123, Bus: testBusId
// [GPS Update] Stored in Redis for bus testBusId
// [GPS Update] Broadcasting to X clients in room bus:testBusId
```

---

### Test 4: Receive GPS Update
```javascript
// Listen for GPS updates
socket.on('bus_location', (data) => {
  console.log('✅ RECEIVED bus_location:', data);
});

socket.on('new_location_update', (data) => {
  console.log('✅ RECEIVED new_location_update:', data);
});

// Now send GPS update (from Test 3)
// You should see both events logged above
```

**Expected Result:**
```
✅ RECEIVED bus_location: {busId: "...", latitude: 0.3476, longitude: 32.5825, ...}
✅ RECEIVED new_location_update: {busId: "...", latitude: 0.3476, longitude: 32.5825, ...}
```

---

### Test 5: Verify Dashboard Updates
1. Keep browser console open with Test 4 running
2. Watch the "Buses Tracking" stat card
3. Send GPS update (Test 3)
4. **Expected:** "Buses Tracking" count increases by 1
5. **Expected:** Orange bus marker appears on map
6. **Expected:** Bus appears in "Active Routes" list with green dot

---

### Test 6: REST Fallback
```javascript
// Test REST endpoint directly
fetch('http://localhost:3000/gps/location/YOUR_BUS_ID', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ REST location:', data);
  // Should return: {busId: "...", latitude: ..., longitude: ...}
});
```

---

## Common Error Messages & Solutions

### Error: "Connection error: Unauthorized"
**Cause:** JWT token missing or invalid
**Solution:**
```javascript
// Check token exists
console.log('Token:', localStorage.getItem('token'));
// If null, login again
// If exists, check if expired (decode token online at jwt.io)
```

---

### Error: "Connection error: Invalid namespace"
**Cause:** Socket.IO namespace mismatch
**Solution:** 
```typescript
// Ensure backend doesn't use namespaces
// backend/src/modules/realtime/realtime.gateway.ts (line 7)
@WebSocketGateway({...})  // No namespace specified = default namespace
```

---

### Error: "Redis connection refused"
**Cause:** Redis not running
**Solution:**
```powershell
cd "C:\Redis-7.4.1\Redis-7.4.1-Windows-x64-msys2"
Start-Process -FilePath "redis-server.exe" -WindowStyle Hidden
redis-cli.exe PING  # Verify: PONG
```

---

### Error: "Cannot read properties of null (reading 'user')"
**Cause:** Bus has no assigned driver
**Solution:** Already fixed in live-dashboard/page.tsx with optional chaining:
```typescript
// Line 84, 118, 288-290
trip.bus.driver?.user ? `${firstName} ${lastName}` : 'No driver'
```

---

### Error: "busLocations is empty {}"
**Cause:** WebSocket not receiving events OR no GPS data sent
**Debug:**
```javascript
// Check if socket connected
console.log('Socket connected?', socketRef.current?.connected);

// Check if listening for events
console.log('Listening for: bus_location, new_location_update');

// Manually trigger GPS update (Test 3 above)
```

---

## Dependencies Installation Check

### Backend
```powershell
cd backend
npm list socket.io ioredis @nestjs/websockets
# Should show:
# socket.io@4.8.1
# ioredis@5.x.x
# @nestjs/websockets@10.x.x
```

**If missing:**
```powershell
npm install socket.io@4.8.1 ioredis @nestjs/websockets @nestjs/platform-socket.io
```

---

### Admin Dashboard
```powershell
cd admin-web
npm list socket.io-client
# Should show: socket.io-client@4.8.1
```

**If missing:**
```powershell
npm install socket.io-client@4.8.1
```

---

### Mobile App (Driver)
```powershell
cd frontend
npm list socket.io-client expo-location
# Should show:
# socket.io-client@4.8.1
# expo-location@17.x.x
```

**If missing:**
```powershell
npm install socket.io-client@4.8.1 expo-location
```

---

## Quick Diagnostic Script

Run this in browser console on admin dashboard:

```javascript
async function diagnosticCheck() {
  console.log('=== GPS TRACKING DIAGNOSTIC ===\n');
  
  // 1. Check environment
  console.log('1. Socket URL:', 'http://localhost:3000');
  console.log('   (from NEXT_PUBLIC_SOCKET_URL)\n');
  
  // 2. Check token
  const token = localStorage.getItem('token');
  console.log('2. Auth Token:', token ? '✅ Present' : '❌ Missing');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('   User ID:', payload.sub);
      console.log('   Role:', payload.role);
      console.log('   Expires:', new Date(payload.exp * 1000).toLocaleString());
    } catch (e) {
      console.log('   ⚠️  Token parse failed');
    }
  }
  console.log('');
  
  // 3. Check backend health
  try {
    const health = await fetch('http://localhost:3000/health');
    console.log('3. Backend Health:', health.ok ? '✅ Healthy' : '❌ Unhealthy');
  } catch (e) {
    console.log('3. Backend Health: ❌ Not reachable');
  }
  console.log('');
  
  // 4. Test WebSocket connection
  console.log('4. Testing WebSocket...');
  const socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['websocket', 'polling']
  });
  
  socket.on('connect', () => {
    console.log('   ✅ Connected! Socket ID:', socket.id);
    console.log('   Transport:', socket.io.engine.transport.name);
    socket.disconnect();
  });
  
  socket.on('connect_error', (err) => {
    console.log('   ❌ Connection failed:', err.message);
  });
  
  // Wait for connection attempt
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('');
  
  // 5. Check active trips
  try {
    const companyId = 'YOUR_COMPANY_ID'; // Replace with actual
    const trips = await fetch(`http://localhost:3000/trips/company/${companyId}/active`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    console.log('5. Active Trips:', trips.length);
    if (trips.length > 0) {
      console.log('   Sample bus ID:', trips[0].bus.id);
    }
  } catch (e) {
    console.log('5. Active Trips: ❌ Failed to fetch');
  }
  console.log('');
  
  // 6. Check children coordinates
  try {
    const companyId = 'YOUR_COMPANY_ID';
    const children = await fetch(`http://localhost:3000/admin/company/${companyId}/children`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json());
    const withCoords = children.filter(c => c.homeLatitude && c.homeLongitude);
    console.log('6. Children with coordinates:', withCoords.length, '/', children.length);
  } catch (e) {
    console.log('6. Children: ❌ Failed to fetch');
  }
  
  console.log('\n=== END DIAGNOSTIC ===');
}

diagnosticCheck();
```

---

## Success Criteria

✅ **WebSocket Connection:**
- Connection status shows "Live" (green dot)
- Browser console shows: `[Socket] Connected: socketId`
- Backend logs show: `Client connected: socketId, User: userId`

✅ **GPS Updates:**
- Driver app shows "GPS tracking active"
- Backend logs show: `[GPS Update] Received from client`
- Redis contains location: `GET bus:busId:location` returns data

✅ **Map Display:**
- "Buses Tracking" stat shows count > 0
- Orange bus markers visible on map
- Bus markers move in real-time (update every 5 seconds)
- Blue markers show children home locations
- Green markers show school locations

✅ **Real-Time Updates:**
- When driver sends GPS, map updates within 1 second
- No page refresh needed
- Multiple browsers see same updates simultaneously

---

## File Structure Reference

```
backend/
├── src/
│   ├── modules/
│   │   ├── realtime/
│   │   │   ├── realtime.gateway.ts    ← WebSocket server
│   │   │   └── realtime.module.ts     ← Module registration
│   │   └── gps/
│   │       ├── gps.controller.ts      ← REST endpoints
│   │       └── gps.service.ts         ← Redis caching
│   └── app.module.ts                  ← RealtimeModule imported

admin-web/
├── src/
│   ├── hooks/
│   │   └── useSocket.ts               ← WebSocket hook
│   ├── app/company/[companyId]/
│   │   └── live-dashboard/
│   │       └── page.tsx               ← Live map page
│   └── components/
│       └── ROSAgoMapClient.tsx        ← Map component
└── .env.local                         ← NEXT_PUBLIC_SOCKET_URL

frontend/ (React Native)
├── src/
│   ├── services/
│   │   ├── gpsService.ts              ← Location tracking
│   │   └── socket.ts                  ← WebSocket client
│   └── utils/
│       └── api.ts                     ← API base URL
```

---

## Next Steps for Your AI Builder

1. **Verify all files exist** in your new version codebase
2. **Check all imports** match the structure above
3. **Install missing dependencies** (socket.io, ioredis, expo-location)
4. **Update environment variables** (SOCKET_URL, API_URL, REDIS_URL)
5. **Run diagnostic script** to identify specific issues
6. **Follow troubleshooting steps** for each failing check
7. **Test incrementally** using the test procedures above

---

**Last updated:** 2026-01-16
**System:** ROSAgo School Bus Management
**Version:** Current working implementation
