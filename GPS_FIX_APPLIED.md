# MASTER PROMPT: Fix GPS Tracking System - SafeRide

> **Give this complete prompt to your AI builder to diagnose and fix all GPS tracking issues**

---

# GPS Tracking Fix Applied - SafeRide

## Issues Found & Fixed

### **Issue 1: Missing Socket URL Environment Variable**
**File:** `admin-web\.env.local`
**Problem:** Only had `NEXT_PUBLIC_API_URL`, missing `NEXT_PUBLIC_SOCKET_URL`
**Result:** useSocket.ts fell back to hardcoded IP `172.20.10.3:3000` which was wrong

**Fix Applied:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000  ← ADDED THIS
```

---

### **Issue 2: WebSocket Never Connects (Root Cause)**
**File:** `admin-web\src\hooks\useSocket.ts` (line 120-125)
**Problem:** Hook tried to connect immediately but `companyId` was `null` on first render
**Logic Flow:**
1. Page loads → `companyId = null`
2. useSocket(null) called → sees null, skips connection (line 23-26)
3. Page fetches school routes → gets companyId
4. But useSocket never reconnects because useEffect doesn't depend on companyId

**Fix Applied:**
```typescript
// BEFORE (line 120-125)
useEffect(() => {
  connect();
  return () => {
    disconnect();
  };
}, [connect, disconnect]);  // Missing companyId dependency!

// AFTER (FIXED)
useEffect(() => {
  if (companyId) {          // Only connect when companyId available
    connect();
  }
  return () => {
    disconnect();
  };
}, [companyId, connect, disconnect]);  // Added companyId to dependencies
```

**Why This Fixes It:**
- Now when `companyId` changes from `null` → actual ID, useEffect runs again
- Socket connects successfully with valid companyId
- Joins company room correctly
- Receives GPS broadcasts

---

## How GPS Tracking Works Now

### Data Flow:
```
1. Page loads school/[schoolId]/live-dashboard
   └─> companyId = null
   └─> useSocket(null) → no connection

2. useEffect fetches school routes (line 76-91)
   └─> Gets routes[0].bus.companyId
   └─> Sets companyId state

3. companyId changes triggers useSocket useEffect
   └─> connect() called with valid companyId
   └─> Socket connects to backend
   └─> Joins company:{companyId} room

4. Driver sends GPS → Backend broadcasts
   └─> company:{companyId} room receives
   └─> Dashboard map updates
```

### Connection Status Now Shows:
- ✅ **"Live"** (green) when WebSocket connected
- ❌ **"Polling"** (red) when WebSocket not connected

---

## Test To Verify Fix Works

### Step 1: Start Backend
```powershell
cd backend
npm run start:dev
```

### Step 2: Start Admin Dashboard
```powershell
cd admin-web
npm run dev
```

### Step 3: Open Browser Console
Navigate to: `http://localhost:3001/school/YOUR_SCHOOL_ID/live-dashboard`

**Expected Console Logs:**
```
[LiveDashboard] Found companyId: abc-123-def
[Socket] Connecting to: http://localhost:3000
[Socket] Connected: socketId
[Socket] Joined company room: abc-123-def
```

### Step 4: Check Connection Status
Look at dashboard - Connection card should show:
- 🟢 **Live** (green dot)
- "WebSocket connected"

---

## What Was NOT Changed

✅ **Backend code** - No changes needed, already correct
✅ **RealtimeGateway** - Working perfectly
✅ **GPS endpoints** - All functional
✅ **Map component** - No UI changes
✅ **Database schema** - No migrations needed

---

## Files Modified

1. `admin-web\.env.local` - Added NEXT_PUBLIC_SOCKET_URL
2. `admin-web\src\hooks\useSocket.ts` - Fixed useEffect dependencies

**Total Changes:** 2 files, 5 lines

---

## Why It Wasn't Working Before

The SafeRide project was copied from ROSAgo which uses `company/[companyId]/live-dashboard`, but SafeRide uses `school/[schoolId]/live-dashboard`.

The dashboard needs to:
1. Fetch companyId from school (async operation)
2. Then connect WebSocket with that companyId

But the useSocket hook was trying to connect immediately, seeing null companyId, and never retrying.

**The fix ensures WebSocket waits for companyId before connecting.**

---

## Success Criteria

After these fixes, you should see:
- ✅ Connection status: **Live** (not Polling)
- ✅ Browser console: `[Socket] Connected: socketId`
- ✅ Backend logs: `Client connected: socketId, User: userId`
- ✅ When driver sends GPS: Bus markers appear on map
- ✅ Children home locations show (if they have coordinates)

---

**Fixed:** January 16, 2026
**System:** SafeRide (School Bus Management)
**Issue:** WebSocket connection failing due to missing companyId dependency

---

# COMPLETE AI BUILDER INSTRUCTIONS

## Your Task
You are replicating a GPS tracking system where drivers send location updates that appear on an admin dashboard map in real-time. The system currently shows "Polling" instead of "Live" and bus locations don't appear.

## System Architecture

### Technology Stack
- **Backend:** NestJS with Socket.IO WebSocket server
- **Frontend:** Next.js admin dashboard with Socket.IO client
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis for GPS location caching
- **Mobile:** React Native driver app (not your concern)

### Data Model (from schema.prisma)
```prisma
model School {
  id         String   @id @default(uuid())
  name       String
  companyId  String   // ← Schools belong to companies
  company    Company  @relation(fields: [companyId], references: [id])
  latitude   Float?
  longitude  Float?
  // ...
}

model Child {
  id              String   @id @default(uuid())
  firstName       String
  lastName        String
  schoolId        String
  school          School   @relation(fields: [schoolId], references: [id])
  homeLatitude    Float?   // ← For pickup markers
  homeLongitude   Float?   // ← For pickup markers
  // ...
}

model Bus {
  id           String    @id @default(uuid())
  plateNumber  String
  companyId    String
  company      Company   @relation(fields: [companyId], references: [id])
  driverId     String?
  driver       Driver?   @relation(fields: [driverId], references: [id])
  // ...
}

model BusLocation {
  id        String   @id @default(uuid())
  busId     String
  bus       Bus      @relation(fields: [busId], references: [id])
  latitude  Float
  longitude Float
  speed     Float
  timestamp DateTime @default(now())
  
  @@index([busId, timestamp(desc)])
}
```

### GPS Data Flow
```
1. Driver App (React Native)
   └─> GPS location every 5 seconds
       └─> socket.emit('gps_update', { busId, latitude, longitude, speed })

2. Backend (RealtimeGateway)
   └─> @SubscribeMessage('gps_update')
       ├─> Store in Redis: bus:{busId}:location (TTL 5min)
       ├─> Save to DB every 5th heartbeat
       └─> Broadcast to clients:
           ├─> server.to(`bus:${busId}`).emit('bus_location', data)
           └─> server.emit('new_location_update', data)

3. Admin Dashboard (Next.js)
   └─> useSocket hook connects to WebSocket
       ├─> socket.emit('join_company_room', { companyId })
       └─> socket.on('bus_location', updateMap)
       └─> socket.on('new_location_update', updateMap)
```

---

## THE TWO BUGS YOU MUST FIX

### Bug #1: Missing Environment Variable

**File:** `admin-web/.env.local`

**Current State:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Problem:** Missing `NEXT_PUBLIC_SOCKET_URL` causes useSocket.ts to fall back to hardcoded IP

**Fix Required:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**Action:** Add the missing line

---

### Bug #2: WebSocket Never Reconnects (CRITICAL)

**File:** `admin-web/src/hooks/useSocket.ts`

**Current Code (BROKEN):**
```typescript
export function useSocket(companyId: string | null) {
  const [connected, setConnected] = useState(false);
  const [busLocations, setBusLocations] = useState<{ [busId: string]: BusLocation }>({});
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback(() => {
    if (!companyId) {
      console.log('[Socket] No companyId, skipping connection');
      return;  // ← EXITS HERE ON FIRST RENDER
    }
    // ... connection logic
  }, [companyId]);

  useEffect(() => {
    connect();  // ← Called with companyId = null
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);  // ← Missing companyId dependency!
  // ...
}
```

**Why It Fails:**
1. Page loads: `school/[schoolId]/live-dashboard`
2. Initial state: `companyId = null`
3. useSocket(null) called → connect() sees null → exits early
4. Page fetches school routes → sets companyId
5. **BUT** useEffect doesn't run again because companyId isn't in dependencies
6. Socket never connects ❌

**Fix Required:**
```typescript
  useEffect(() => {
    if (companyId) {  // ← Only connect when companyId available
      connect();
    }
    return () => {
      disconnect();
    };
  }, [companyId, connect, disconnect]);  // ← ADD companyId here!
```

**Why This Works:**
- When companyId changes from `null` → actual ID, useEffect runs again
- connect() is called with valid companyId
- Socket connects and joins company room
- GPS updates received ✅

---

## COMPLETE FILE CHANGES

### Change 1: admin-web/.env.local
```diff
 NEXT_PUBLIC_API_URL=http://localhost:3000
+NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Change 2: admin-web/src/hooks/useSocket.ts (around line 120-125)
```diff
  useEffect(() => {
-   connect();
+   if (companyId) {
+     connect();
+   }
    return () => {
      disconnect();
    };
- }, [connect, disconnect]);
+ }, [companyId, connect, disconnect]);
```

---

## VERIFICATION STEPS

### After Applying Fixes:

**1. Restart Admin Dashboard**
```bash
cd admin-web
npm run dev
```

**2. Open Browser Console**
Navigate to: `http://localhost:3001/school/YOUR_SCHOOL_ID/live-dashboard`

**3. Expected Console Output:**
```
[LiveDashboard] Found companyId: abc-123-def
[Socket] Connecting to: http://localhost:3000
[Socket] Connected: socketId
[Socket] Joined company room: abc-123-def
```

**4. Check Connection Status Card**
- Should show: 🟢 **Live** (green dot)
- Text: "WebSocket connected"
- NOT: ❌ **Polling** (red dot)

**5. Test GPS Updates**
When driver sends GPS:
```
[Socket] *** BUS_LOCATION EVENT RECEIVED ***
[Socket] Bus location data: {"busId":"...","latitude":...,"longitude":...}
[Socket] Updated bus locations: 1 buses
```

**6. Verify Map Markers**
- Bus markers (orange) appear on map
- Children home locations (blue) appear if they have coordinates
- School locations (green) appear

---

## COMMON MISTAKES TO AVOID

### ❌ Don't Do This:
```typescript
// WRONG: Missing companyId check
useEffect(() => {
  connect();  // Will fail if companyId is null
}, [companyId, connect, disconnect]);
```

### ✅ Do This:
```typescript
// CORRECT: Check companyId before connecting
useEffect(() => {
  if (companyId) {  // Guard clause
    connect();
  }
}, [companyId, connect, disconnect]);
```

---

## API ENDPOINTS REFERENCE

### GPS Tracking Endpoints
```typescript
// Backend endpoints you should NOT modify
POST   /gps/heartbeat              // Driver sends location
GET    /gps/location/:busId         // Get latest bus location
GET    /trips/company/:companyId/active  // Get active trips
GET    /admin/company/:companyId/children  // Get children with coordinates
GET    /admin/company/:companyId/schools   // Get schools with coordinates
```

### WebSocket Events
```typescript
// Client → Server
socket.emit('join_company_room', { companyId: string })
socket.emit('join_bus_room', { busId: string })
socket.emit('gps_update', { busId, latitude, longitude, speed })

// Server → Client
socket.on('bus_location', (data: BusLocation) => { })
socket.on('new_location_update', (data: BusLocation) => { })
```

---

## REDIS KEYS
```typescript
// GPS location cache (TTL 5 minutes)
bus:{busId}:location = JSON.stringify({ busId, latitude, longitude, speed, timestamp })

// Heartbeat counter
bus:{busId}:heartbeat_count = number  // Save to DB every 5th increment
```

---

## SUCCESS CRITERIA

After applying both fixes, verify:

✅ **Connection Status:** Shows "Live" with green dot
✅ **Browser Console:** No connection errors, shows "Connected: socketId"
✅ **Backend Logs:** Shows "Client connected" messages
✅ **GPS Updates:** Bus markers appear and move on map in real-time
✅ **Pickup Markers:** Blue markers show children home locations
✅ **School Markers:** Green markers show school locations
✅ **Stats Card:** "Buses Tracking" shows count > 0 when GPS active

---

## WHAT NOT TO CHANGE

🚫 **Do NOT modify:**
- Backend `RealtimeGateway` - Already correct
- Backend GPS endpoints - Already working
- Database schema - No migrations needed
- Map components - UI is fine
- Any other dashboard pages

✅ **Only change:**
- `admin-web/.env.local` - Add NEXT_PUBLIC_SOCKET_URL
- `admin-web/src/hooks/useSocket.ts` - Fix useEffect dependencies

**Total changes: 2 files, 5 lines**

---

## DEBUGGING COMMANDS

If issues persist after fixes:

```bash
# Check Redis is running
redis-cli PING  # Should return PONG

# Check if location data is cached
redis-cli
KEYS bus:*:location
GET bus:YOUR_BUS_ID:location

# Check backend is running
curl http://localhost:3000/health

# Check WebSocket endpoint
# Open browser console and run:
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('token') }
});
socket.on('connect', () => console.log('Connected!'));
```

---

## EXPLANATION FOR UNDERSTANDING

### Why companyId is null initially?

The SafeRide dashboard uses `school/[schoolId]/live-dashboard` route.
To join the correct WebSocket room, it needs the **companyId**.

Schools belong to companies:
```typescript
School { id, name, companyId }  // School links to Company
```

The dashboard must:
1. Fetch school's routes: `GET /routes/school/${schoolId}`
2. Extract companyId from first route's bus
3. Then connect WebSocket with that companyId

This is an **async operation** - companyId isn't available on first render.

The bug was that useSocket tried to connect immediately, failed, and never retried.

The fix ensures useSocket waits for companyId, then connects.

---

## FINAL CHECKLIST

Before testing:
- [ ] Added NEXT_PUBLIC_SOCKET_URL to admin-web/.env.local
- [ ] Modified useEffect in admin-web/src/hooks/useSocket.ts
- [ ] Added companyId to useEffect dependency array
- [ ] Added if (companyId) guard before connect()
- [ ] Restarted admin dashboard (npm run dev)
- [ ] Backend is running (npm run start:dev)
- [ ] Redis is running (redis-cli PING)

After testing:
- [ ] Browser console shows "Connected: socketId"
- [ ] Connection status shows "Live" (green)
- [ ] No console errors
- [ ] Map renders without crashes

If all checkboxes pass: **GPS tracking is fixed!** 🎉

---

**Use this prompt to guide your implementation. Apply the exact changes shown above.**
