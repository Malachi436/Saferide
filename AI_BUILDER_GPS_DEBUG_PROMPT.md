# AI Builder Diagnostic Prompt - GPS Tracking System Debug

## Task Overview
I'm replicating a GPS tracking system where:
- **Driver mobile app** sends GPS location updates via WebSocket
- **Admin web dashboard** should display live bus locations on a map
- **Connection status shows "Polling" instead of "Live"** (WebSocket not connecting)
- **Bus locations don't appear on the map** (no markers showing)
- **Children home locations don't show** (pickup points missing)

## What I Need You To Do

**Step 1: Analyze Current Implementation**
Please read and analyze the following files from the existing working codebase to understand the exact structure:

### Backend Files (GPS & WebSocket)
1. `backend/src/modules/realtime/realtime.gateway.ts` - WebSocket server implementation
2. `backend/src/modules/realtime/realtime.module.ts` - Module registration
3. `backend/src/modules/gps/gps.controller.ts` - GPS REST endpoints
4. `backend/src/modules/gps/gps.service.ts` - GPS service with Redis caching
5. `backend/src/modules/gps/gps.module.ts` - GPS module registration
6. `backend/src/app.module.ts` - Main app module imports
7. `backend/package.json` - Dependencies (check socket.io version)
8. `backend/.env` - Environment variables (REDIS_URL, JWT_ACCESS_SECRET)

### Admin Dashboard Files (Frontend)
1. `admin-web/src/hooks/useSocket.ts` - WebSocket client hook
2. `admin-web/src/app/company/[companyId]/live-dashboard/page.tsx` - Live dashboard page
3. `admin-web/src/components/ROSAgoMapClient.tsx` - Map component
4. `admin-web/package.json` - Dependencies (check socket.io-client version)
5. `admin-web/.env.local` - Environment variables (NEXT_PUBLIC_SOCKET_URL)
6. `admin-web/src/lib/api-client.ts` - API client configuration

### Database Schema
1. `backend/prisma/schema.prisma` - Check for:
   - `BusLocation` model with latitude/longitude fields
   - `Child` model with homeLatitude/homeLongitude fields
   - `School` model with latitude/longitude fields
   - `Bus` model relationships to Driver

### For Each File, Document:
```
File: [filename]
Purpose: [what this file does]
Key Code Sections:
  1. [section name] (lines X-Y)
     - What it does
     - How it connects to other parts
     
Dependencies:
  - [list imports and their usage]
  
Configuration:
  - [environment variables used]
  - [hardcoded values that might need changing]
  
Potential Issues:
  - [anything that could cause the reported problems]
```

---

**Step 2: Trace The Complete Data Flow**

Map out the **exact sequence** from driver sending GPS to dashboard displaying it:

```
1. Driver App Sends GPS
   File: [file path]
   Function: [function name]
   Code: [relevant code snippet]
   Emits: socket.emit('EVENT_NAME', { data })
   
2. Backend Receives GPS
   File: [file path]
   Decorator: @SubscribeMessage('EVENT_NAME')
   Function: [function name]
   What it does:
     a) Stores in Redis: [show code]
     b) Saves to DB: [show code]
     c) Broadcasts: [show code]
   
3. Backend Broadcasts To Clients
   File: [file path]
   Function: [function name]
   Emits: this.server.emit('EVENT_NAME', data)
   Rooms: [which rooms it broadcasts to]
   
4. Dashboard Receives Event
   File: [file path]
   Listener: socket.on('EVENT_NAME', callback)
   What it does: [show code]
   Updates State: [show state update code]
   
5. Map Component Displays
   File: [file path]
   Props: [what props it receives]
   How it renders: [show rendering logic]
```

---

**Step 3: Check WebSocket Connection Flow**

Trace the WebSocket connection establishment:

```
A. Frontend Initiates Connection
   File: [file path]
   Code that creates socket:
   [paste code snippet]
   
   Config:
   - Socket URL: [value]
   - Auth: [how token is passed]
   - Transports: [websocket, polling, etc]

B. Backend Accepts Connection
   File: [file path]
   Function: handleConnection(client: Socket)
   Authentication logic:
   [paste code snippet]
   
   Rooms joined:
   [list what rooms client joins]

C. Client Joins Company Room
   Frontend emits: [event name and data]
   Backend handler: [function name]
   [paste handler code]

D. Connection Success Indicators
   Frontend state: [what variable tracks connection]
   Frontend logs: [what console.log messages appear]
   Backend logs: [what server logs show]
```

---

**Step 4: Identify API Endpoints Used**

List all API endpoints involved in GPS tracking:

```
1. POST /gps/heartbeat
   Purpose: [description]
   Request Body: [structure]
   Auth Required: [yes/no, what role]
   Response: [structure]
   Related Code: [file and function]

2. GET /gps/location/:busId
   Purpose: [description]
   Parameters: [busId]
   Auth Required: [yes/no, what role]
   Response: [structure]
   Related Code: [file and function]

3. GET /trips/company/:companyId/active
   Purpose: [description]
   Parameters: [companyId]
   Auth Required: [yes/no, what role]
   Response: [structure with nested bus/driver/route]
   Related Code: [file and function]

4. GET /admin/company/:companyId/children
   Purpose: [description]
   Returns: [what fields, especially homeLatitude/homeLongitude]
   Related Code: [file and function]

5. GET /admin/company/:companyId/schools
   Purpose: [description]
   Returns: [what fields, especially latitude/longitude]
   Related Code: [file and function]
```

---

**Step 5: Check Dashboard Component Integration**

Show how components are connected:

```
LiveDashboardPage Component:
  File: [path]
  
  State Variables:
  - activeTrips: [type and how it's populated]
  - busLocations: [type and how it's populated]
  - schools: [type and how it's populated]
  - pickups: [type and how it's populated]
  - connected: [where this comes from]
  
  useSocket Hook:
    Returns: { connected, busLocations }
    How busLocations updates: [paste relevant code]
  
  useEffect Dependencies:
    - When does it fetch data?
    - When does it connect socket?
    - What triggers re-renders?
  
  Props Passed To Map:
    <ROSAgoMap
      busLocations={[what exactly is passed]}
      schools={[what exactly is passed]}
      pickups={[what exactly is passed]}
    />
  
Map Component (ROSAgoMapClient):
  File: [path]
  
  How it receives busLocations:
  [paste props interface]
  
  How it renders markers:
  [paste marker rendering code]
  
  What happens when busLocations updates:
  [paste useEffect or render logic]
```

---

**Step 6: Environment Configuration Check**

Document all environment variables:

```
Backend (.env):
  REDIS_URL=[value]
  JWT_ACCESS_SECRET=[value]
  DATABASE_URL=[value]
  PORT=[value]

Admin Dashboard (.env.local):
  NEXT_PUBLIC_API_URL=[value]
  NEXT_PUBLIC_SOCKET_URL=[value]

Mobile App:
  API_BASE_URL=[value from code]
  SOCKET_URL=[value from code]

Questions:
- Do all URLs point to the same backend?
- Is the backend IP address correct?
- Are ports consistent?
```

---

**Step 7: Verify Module Registration**

Show how modules are registered:

```
AppModule (backend/src/app.module.ts):
  imports: [
    // ... paste the imports array
  ]
  
  Verify RealtimeModule is included: [YES/NO]
  Verify GpsModule is included: [YES/NO]

RealtimeModule (backend/src/modules/realtime/realtime.module.ts):
  imports: [
    // ... paste imports
  ]
  providers: [
    // ... paste providers
  ]
  exports: [
    // ... paste exports
  ]
  
  Is RealtimeGateway in providers? [YES/NO]
  Is JwtModule imported? [YES/NO]
  Is PrismaModule imported? [YES/NO]
```

---

**Step 8: Check Socket.IO Event Names**

List all WebSocket events used:

```
BACKEND EMITS:
1. Event: 'bus_location'
   File: [file]
   Line: [line number]
   To: [room or broadcast]
   Data: [structure]

2. Event: 'new_location_update'
   File: [file]
   Line: [line number]
   To: [room or broadcast]
   Data: [structure]

BACKEND LISTENS FOR:
1. Event: 'gps_update'
   File: [file]
   Handler: [function name]
   Expected Data: [structure]

2. Event: 'join_company_room'
   File: [file]
   Handler: [function name]
   Expected Data: [structure]

FRONTEND LISTENS FOR:
1. Event: 'bus_location'
   File: [file]
   Line: [line number]
   Handler: [what it does]

2. Event: 'new_location_update'
   File: [file]
   Line: [line number]
   Handler: [what it does]

FRONTEND EMITS:
1. Event: 'join_company_room'
   File: [file]
   Line: [line number]
   Data sent: [structure]

DO THESE MATCH? [YES/NO for each pair]
```

---

**Step 9: Database Schema Analysis**

Show the relevant models:

```sql
-- BusLocation Model
model BusLocation {
  [paste full model definition]
}

-- Does it have these fields?
- id: [YES/NO]
- busId: [YES/NO]
- latitude: [YES/NO]
- longitude: [YES/NO]
- speed: [YES/NO]
- timestamp: [YES/NO]

-- Child Model (relevant fields)
model Child {
  homeLatitude: [type]
  homeLongitude: [type]
  homeAddress: [type]
  [other relevant fields]
}

-- School Model (relevant fields)
model School {
  latitude: [type]
  longitude: [type]
  [other relevant fields]
}

-- Check if migrations are up to date:
Run: npx prisma migrate status
Result: [paste output]
```

---

**Step 10: Test Data Availability**

Check if data exists in database:

```sql
-- Run these queries and paste results:

1. Check active trips:
   SELECT COUNT(*) FROM "Trip" 
   WHERE status IN ('SCHEDULED', 'IN_PROGRESS');
   Result: [number]

2. Check buses with drivers:
   SELECT COUNT(*) FROM "Bus" WHERE "driverId" IS NOT NULL;
   Result: [number]

3. Check children with coordinates:
   SELECT COUNT(*) FROM "Child" 
   WHERE "homeLatitude" IS NOT NULL 
   AND "homeLongitude" IS NOT NULL;
   Result: [number]

4. Check schools with coordinates:
   SELECT COUNT(*) FROM "School" 
   WHERE latitude IS NOT NULL 
   AND longitude IS NOT NULL;
   Result: [number]

5. Check bus locations in DB:
   SELECT COUNT(*) FROM "BusLocation";
   Result: [number]

6. Check Redis has GPS data:
   redis-cli
   KEYS bus:*:location
   Result: [list of keys or (empty list)]
```

---

**Step 11: Package Dependencies Check**

List installed versions:

```
Backend:
npm list socket.io @nestjs/websockets @nestjs/platform-socket.io ioredis

Output:
[paste output]

Admin Dashboard:
npm list socket.io-client

Output:
[paste output]

Are versions compatible?
- socket.io backend: [version]
- socket.io-client frontend: [version]
- Do major versions match? [YES/NO]
```

---

**Step 12: Runtime Diagnostics**

When the system is running, capture:

```
A. Backend Console Output:
[paste last 50 lines when GPS update should happen]

Look for:
- "Client connected" messages
- "GPS Update Received" messages
- "Broadcasting to X clients" messages
- Any error messages

B. Browser Console (Admin Dashboard):
[paste console output from live-dashboard page]

Look for:
- [Socket] Connecting to: [url]
- [Socket] Connected: [socketId]
- [Socket] Joined company room
- [Socket] Bus location received
- Any error messages

C. Network Tab (Admin Dashboard):
Open DevTools → Network → WS (WebSocket)

- Is there a WebSocket connection? [YES/NO]
- What is the status? [101 Switching Protocols / Failed]
- Are messages being sent/received? [YES/NO]
- Screenshot or describe what you see

D. Redis CLI Check:
redis-cli
> KEYS *
[paste output - list all keys]

> GET bus:YOUR_BUS_ID:location
[paste output or (nil)]
```

---

**Step 13: Compare Working vs Non-Working**

If you have a working version, show differences:

```
Working Version:
- Backend Socket URL: [value]
- Frontend Socket URL: [value]
- Event names: [list]
- Module structure: [describe]

Non-Working Version (New):
- Backend Socket URL: [value]
- Frontend Socket URL: [value]
- Event names: [list]
- Module structure: [describe]

Differences Found:
1. [difference 1]
2. [difference 2]
3. [etc]
```

---

## Expected Deliverable From You (AI Builder)

After analyzing all of the above, provide:

### 1. **Complete System Map**
A visual representation showing:
```
[Driver App] --socket.emit('gps_update')--> [Backend Gateway]
                                                    |
                                    [Redis Cache + DB Save]
                                                    |
                        server.emit('bus_location', data)
                                                    |
                [Admin Dashboard] <--socket.on('bus_location')--
                        |
                [Map Component renders markers]
```

### 2. **Issue Diagnosis**
```
PRIMARY ISSUE: [exact problem]
ROOT CAUSE: [technical cause]

Evidence:
- [observation 1]
- [observation 2]
- [observation 3]

Why it's failing:
[detailed explanation with code references]
```

### 3. **Exact Fix Required**
```
File: [path]
Current Code (lines X-Y):
[paste current code]

Should Be:
[paste corrected code]

Explanation:
[why this fixes the issue]
```

### 4. **Implementation Checklist**
```
[ ] Step 1: [specific action]
[ ] Step 2: [specific action]
[ ] Step 3: [specific action]
[ ] Step 4: Test connection
[ ] Step 5: Test GPS broadcast
[ ] Step 6: Verify map updates
```

### 5. **Verification Script**
```javascript
// Paste this in browser console to verify fix
[provide complete test script]
```

---

## Critical Files You MUST Read

**Priority 1 (WebSocket):**
- `backend/src/modules/realtime/realtime.gateway.ts`
- `admin-web/src/hooks/useSocket.ts`

**Priority 2 (GPS):**
- `backend/src/modules/gps/gps.service.ts`
- `backend/src/modules/gps/gps.controller.ts`

**Priority 3 (Dashboard):**
- `admin-web/src/app/company/[companyId]/live-dashboard/page.tsx`
- `admin-web/src/components/ROSAgoMapClient.tsx`

**Priority 4 (Config):**
- `backend/.env`
- `admin-web/.env.local`
- `backend/src/app.module.ts`

**Priority 5 (Database):**
- `backend/prisma/schema.prisma`

---

## Questions To Answer

1. **Is the WebSocket gateway properly decorated with `@WebSocketGateway()`?**
2. **Is RealtimeModule exported and imported in AppModule?**
3. **Does the frontend Socket URL match the backend address?**
4. **Is JWT token being sent in `auth: { token }` when connecting?**
5. **Are event names identical between emit and listen?**
6. **Is Redis running and accessible?**
7. **Do children/schools have lat/lng coordinates in database?**
8. **Are there active trips with status IN_PROGRESS or SCHEDULED?**
9. **Is the map component receiving the busLocations prop correctly?**
10. **Does the backend log show any authentication or connection errors?**

---

## Success Criteria

After your fixes, I should see:
- ✅ Connection status shows "Live" (green dot) not "Polling" (red)
- ✅ Browser console shows: `[Socket] Connected: socketId`
- ✅ Backend logs show: `Client connected: socketId, User: userId`
- ✅ When driver sends GPS, map marker appears immediately
- ✅ "Buses Tracking" stat shows count > 0
- ✅ Blue markers show children home locations
- ✅ Green markers show school locations

---

**Current Codebase Location:** `c:\Users\user\Desktop\qoder ROSAgo\rosago\`

**Start by reading the Priority 1 files and work your way down. Document everything you find using the format above.**
