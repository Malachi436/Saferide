# Driver-Trip-Route System Replication Guide for AI Builder

## System Overview
You are replicating a school bus management system with driver-route-trip-attendance functionality. Read the existing codebase thoroughly, understand the logic, then implement missing pieces or fix broken functionality.

## Core Database Models & Relationships

### 1. Driver → Bus → Route → ScheduledRoute → Trip → Children → Attendance

```prisma
// Driver Model
model Driver {
  id              String           @id @default(uuid())
  license         String           @unique
  userId          String           @unique
  user            User             @relation(fields: [userId], references: [id])
  buses           Bus[]
  trips           Trip[]
  scheduledRoutes ScheduledRoute[]
}

// Bus Model
model Bus {
  id              String           @id @default(uuid())
  plateNumber     String           @unique
  capacity        Int
  companyId       String?
  driverId        String?          // OPTIONAL - can be null
  driver          Driver?          @relation(fields: [driverId], references: [id])
  routes          Route[]
  trips           Trip[]
  scheduledRoutes ScheduledRoute[]
}

// Route Model (Physical path/stops)
model Route {
  id              String           @id @default(uuid())
  name            String
  schoolId        String
  busId           String?
  shift           String?          // "MORNING" or "AFTERNOON"
  children        Child[]          // Kids assigned to this route
  stops           Stop[]
  trips           Trip[]
  scheduledRoutes ScheduledRoute[]
}

// ScheduledRoute Model (Recurring schedule template)
model ScheduledRoute {
  id                 String         @id @default(uuid())
  routeId            String
  route              Route          @relation(fields: [routeId], references: [id])
  driverId           String
  driver             Driver         @relation(fields: [driverId], references: [id])
  busId              String
  bus                Bus            @relation(fields: [busId], references: [id])
  scheduledTime      String         // "07:00"
  recurringDays      DayOfWeek[]    // [MONDAY, TUESDAY, etc.]
  status             ScheduleStatus @default(ACTIVE)
  autoAssignChildren Boolean        @default(true)
  effectiveFrom      DateTime?
  effectiveUntil     DateTime?
}

// Trip Model (Daily instance generated from ScheduledRoute)
model Trip {
  id          String            @id @default(uuid())
  busId       String
  bus         Bus               @relation(fields: [busId], references: [id])
  routeId     String
  route       Route             @relation(fields: [routeId], references: [id])
  driverId    String
  driver      Driver            @relation(fields: [driverId], references: [id])
  status      TripStatus        @default(SCHEDULED)
  startTime   DateTime?
  endTime     DateTime?
  attendances ChildAttendance[]
}

// Child Model
model Child {
  id          String            @id @default(uuid())
  firstName   String
  lastName    String
  routeId     String?           // OPTIONAL - which route assigned to
  route       Route?            @relation(fields: [routeId], references: [id])
  attendance  ChildAttendance[]
}

// ChildAttendance Model
model ChildAttendance {
  id         String           @id @default(uuid())
  childId    String
  child      Child            @relation(fields: [childId], references: [id])
  tripId     String
  trip       Trip             @relation(fields: [tripId], references: [id])
  status     AttendanceStatus // PENDING, PICKED_UP, DROPPED, MISSED
  timestamp  DateTime         @default(now())
  recordedBy String           // userId of driver
  
  @@unique([childId, tripId])
}
```

## Critical Logic Flows

### Flow 1: Automated Trip Generation (Daily at 2 AM)

**File:** `backend/workers/analytics.worker.ts` or similar worker
**Technology:** BullMQ with Redis

```typescript
// Runs daily at 2 AM
async function generateDailyTrips() {
  const today = new Date();
  const dayOfWeek = getDayOfWeek(today); // "MONDAY", "TUESDAY", etc.
  
  // Find all ACTIVE schedules for today
  const schedules = await prisma.scheduledRoute.findMany({
    where: {
      status: 'ACTIVE',
      recurringDays: { has: dayOfWeek }
    },
    include: {
      route: { include: { children: true } },
      driver: true,
      bus: true
    }
  });
  
  for (const schedule of schedules) {
    // Create Trip
    const trip = await prisma.trip.create({
      data: {
        routeId: schedule.routeId,
        driverId: schedule.driverId,
        busId: schedule.busId,
        status: 'SCHEDULED',
        startTime: parseTime(schedule.scheduledTime, today)
      }
    });
    
    // Auto-assign children if enabled
    if (schedule.autoAssignChildren) {
      for (const child of schedule.route.children) {
        await prisma.childAttendance.create({
          data: {
            childId: child.id,
            tripId: trip.id,
            status: 'PENDING'
          }
        });
      }
    }
  }
}
```

### Flow 2: Child Auto-Sync to Today's Trips

**File:** `backend/src/modules/children/children.service.ts`
**Trigger:** When admin updates `child.routeId`

```typescript
async updateChild(childId: string, data: { routeId?: string }) {
  const child = await prisma.child.update({
    where: { id: childId },
    data
  });
  
  // If routeId changed, sync to TODAY's trips
  if (data.routeId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTrips = await prisma.trip.findMany({
      where: {
        routeId: data.routeId,
        createdAt: { gte: today }
      }
    });
    
    // Auto-create attendance for each trip
    for (const trip of todayTrips) {
      await prisma.childAttendance.upsert({
        where: {
          childId_tripId: { childId, tripId: trip.id }
        },
        create: {
          childId,
          tripId: trip.id,
          status: 'PENDING'
        },
        update: {} // Do nothing if exists
      });
    }
  }
  
  return child;
}
```

### Flow 3: Driver Gets Today's Trip

**File:** `backend/src/modules/drivers/drivers.controller.ts`
**Endpoint:** `GET /drivers/:id/today-trip`

```typescript
@Get(':id/today-trip')
async getTodayTrip(@Param('id') driverId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const trip = await prisma.trip.findFirst({
    where: {
      driverId,
      createdAt: { gte: today }
    },
    include: {
      route: {
        include: {
          stops: { orderBy: { order: 'asc' } },
          children: true
        }
      },
      bus: true,
      attendances: {
        include: { child: true }
      }
    }
  });
  
  if (!trip) {
    throw new NotFoundException('No trip scheduled for today');
  }
  
  return trip;
}
```

### Flow 4: Mark Attendance

**File:** `backend/src/modules/attendance/attendance.controller.ts`
**Endpoint:** `POST /attendance`

```typescript
@Post()
async markAttendance(
  @Body() dto: { childId: string; tripId: string; status: AttendanceStatus },
  @Req() req
) {
  const attendance = await prisma.childAttendance.upsert({
    where: {
      childId_tripId: { childId: dto.childId, tripId: dto.tripId }
    },
    create: {
      childId: dto.childId,
      tripId: dto.tripId,
      status: dto.status,
      recordedBy: req.user.userId,
      timestamp: new Date()
    },
    update: {
      status: dto.status,
      timestamp: new Date()
    }
  });
  
  // Send notification to parent
  await this.notificationService.sendPickupNotification(dto.childId, dto.status);
  
  return attendance;
}
```

## Complete API Endpoints Reference

### Driver Management
```
POST   /drivers                           - Create driver
GET    /drivers                           - List all drivers
GET    /drivers/:id                       - Get driver details
GET    /drivers/:id/today-trip            - Get driver's trip for today
PATCH  /drivers/:id                       - Update driver
DELETE /drivers/:id                       - Delete driver
```

### Bus Management
```
POST   /buses                             - Create bus
GET    /buses                             - List all buses
GET    /buses/company/:companyId          - List company buses
PATCH  /buses/:id                         - Update bus (including driverId)
DELETE /buses/:id                         - Delete bus
```

### Route Management
```
POST   /routes                            - Create route
GET    /routes                            - List routes
GET    /routes/:id                        - Get route details
GET    /routes/school/:schoolId           - Get school routes
PATCH  /routes/:id                        - Update route
DELETE /routes/:id                        - Delete route
POST   /routes/auto-generate/:schoolId   - Auto-generate routes
```

### Scheduled Route Management
```
POST   /scheduled-routes                  - Create schedule
GET    /scheduled-routes                  - List schedules
GET    /scheduled-routes/company/:companyId - Company schedules
PUT    /scheduled-routes/:id              - Update schedule
PUT    /scheduled-routes/:id/suspend      - Suspend schedule
PUT    /scheduled-routes/:id/activate     - Activate schedule
DELETE /scheduled-routes/:id              - Delete schedule
```

### Trip Management
```
POST   /trips                             - Create trip (manual)
GET    /trips                             - List trips
GET    /trips/:id                         - Get trip details
GET    /trips/company/:companyId/active   - Get active trips
PATCH  /trips/:id                         - Update trip (DAILY OVERRIDE)
PATCH  /trips/:id/status                  - Update trip status
POST   /trips/generate-today              - Manual trip generation
DELETE /trips/:id                         - Delete trip
```

### Attendance Management
```
POST   /attendance                        - Mark attendance
GET    /attendance/trip/:tripId           - Get trip attendance
GET    /attendance/child/:childId         - Get child history
PATCH  /attendance/:id                    - Update attendance
```

### Children Management
```
POST   /children                          - Create child
GET    /children                          - List children
GET    /children/parent/:parentId         - Get parent's children
PATCH  /children/:id                      - Update child (triggers auto-sync)
POST   /children/bulk-onboard             - Bulk create children
DELETE /children/:id                      - Delete child
```

## Last-Minute Change Scenarios

### Scenario 1: Driver Sick Today Only (One-Time Override)
```
1. Find trip: GET /trips?date=today&driverId=john-id
2. Update trip: PATCH /trips/:tripId
   Body: { driverId: "substitute-id", busId: "substitute-bus-id" }
3. Result: Only TODAY affected, tomorrow reverts to schedule
```

### Scenario 2: Driver on Leave (2 Weeks)
```
1. Suspend original schedule:
   PUT /scheduled-routes/:scheduleId/suspend

2. Create temporary schedule:
   POST /scheduled-routes
   Body: {
     routeId: "same-route",
     driverId: "temp-driver-id",
     effectiveFrom: "2026-01-20",
     effectiveUntil: "2026-02-03"
   }

3. After leave, reactivate:
   PUT /scheduled-routes/:scheduleId/activate
```

### Scenario 3: Permanent Driver Change
```
Option A: Change bus assignment
  PATCH /buses/:busId { driverId: "new-driver-id" }

Option B: Change schedule
  PUT /scheduled-routes/:scheduleId { driverId: "new-driver-id" }
```

## Driver Assignment Methods Summary

| Method | Scope | Endpoint | Effect |
|--------|-------|----------|--------|
| Bus Assignment | All routes using bus | `PATCH /buses/:id` | Permanent |
| Schedule Update | Future trips from schedule | `PUT /scheduled-routes/:id` | Semi-permanent |
| Trip Override | Single trip only | `PATCH /trips/:id` | One-time |
| Temporary Schedule | Date range | `POST /scheduled-routes` with dates | Temporary |
| Emergency Dashboard | Single trip via UI | Admin UI action | One-time |

## Common Issues & Solutions

### Issue 1: Trips Not Generating
**Check:**
- Is worker running? Check BullMQ queue
- Is Redis connected?
- Is ScheduledRoute status = ACTIVE?
- Does recurringDays include today?

**Fix:**
```typescript
// Manual generation endpoint for testing
POST /trips/generate-today
```

### Issue 2: Children Not Appearing in Driver App
**Check:**
- Is child.routeId set correctly?
- Was auto-sync triggered?
- Does attendance record exist?

**Fix:**
```typescript
// Manually sync child to today's trips
PATCH /children/:childId { routeId: "route-id" }
// Backend should auto-create attendances
```

### Issue 3: Driver Can't Mark Attendance
**Check:**
- Does driver have today's trip?
- Is attendance record created?
- Is childId in trip.attendances[]?

**Fix:**
```typescript
// Create missing attendance
POST /attendance {
  childId: "child-id",
  tripId: "trip-id",
  status: "PENDING"
}
```

### Issue 4: Schedule Changes Don't Affect Today
**Explanation:** Schedule changes only affect FUTURE trips
**Solution:** Use trip override for today:
```typescript
PATCH /trips/:todayTripId { driverId: "new-driver-id" }
```

## Testing Checklist

### Phase 1: Basic Setup
- [ ] Create company, school, buses, drivers
- [ ] Verify bus.driverId assignment works
- [ ] Create route with stops and children
- [ ] Verify child.routeId assignment works

### Phase 2: Scheduled Routes
- [ ] Create ScheduledRoute with ACTIVE status
- [ ] Set recurringDays to include tomorrow
- [ ] Wait for 2 AM or trigger manual generation
- [ ] Verify Trip created with correct routeId, driverId, busId
- [ ] Verify ChildAttendance records auto-created

### Phase 3: Driver App
- [ ] Call GET /drivers/:id/today-trip
- [ ] Verify response includes route, stops, children
- [ ] Verify attendances array populated
- [ ] Mark attendance: POST /attendance
- [ ] Verify parent receives notification

### Phase 4: Last-Minute Changes
- [ ] Update trip driver: PATCH /trips/:id
- [ ] Verify old driver no longer sees trip
- [ ] Verify new driver sees trip
- [ ] Verify attendances transfer correctly

### Phase 5: Auto-Sync
- [ ] Assign child to route at 8:30 AM (after trip generated)
- [ ] Verify attendance auto-created for today's trip
- [ ] Driver refreshes app, sees new child
- [ ] Mark new child attendance

## Key Files to Review in Existing Codebase

```
backend/
├── prisma/schema.prisma              - Database models
├── src/modules/
│   ├── drivers/
│   │   ├── drivers.controller.ts     - GET /drivers/:id/today-trip
│   │   └── drivers.service.ts
│   ├── trips/
│   │   ├── trips.controller.ts       - PATCH /trips/:id for override
│   │   └── trips.service.ts          - Trip generation logic
│   ├── scheduled-routes/
│   │   ├── scheduled-routes.controller.ts - Suspend/Activate
│   │   └── scheduled-routes.service.ts
│   ├── children/
│   │   ├── children.controller.ts
│   │   └── children.service.ts       - Auto-sync on routeId change
│   └── attendance/
│       ├── attendance.controller.ts  - POST /attendance
│       └── attendance.service.ts
└── workers/
    └── analytics.worker.ts           - Daily trip generation at 2 AM
```

## Implementation Instructions

1. **Read existing codebase completely** - Don't assume, verify
2. **Check database schema** - Ensure all FKs and relations exist
3. **Test each flow independently** - Don't skip testing phases
4. **Fix missing auto-sync** - Critical for child assignment
5. **Verify worker is running** - Trips won't generate without it
6. **Add proper error handling** - Return meaningful errors
7. **Test last-minute changes** - Most common use case
8. **Ensure WebSocket updates** - For real-time dashboard

## Questions to Answer from Codebase Review

1. Is the daily trip generation worker implemented and running?
2. Does PATCH /children/:id trigger auto-sync to today's trips?
3. Does GET /drivers/:id/today-trip include all required nested data?
4. Does PATCH /trips/:id properly update without affecting schedule?
5. Are attendance records created automatically on trip generation?
6. Do schedule suspend/activate endpoints work correctly?
7. Is there proper validation (e.g., can't create schedule without driver)?
8. Are WebSocket events emitted on attendance changes?

## Success Criteria

✅ Driver can open app and see today's trip with all children
✅ Driver can mark each child as PICKED_UP/DROPPED/MISSED
✅ Parent receives real-time notification when child picked up
✅ Admin can change driver for today only without affecting schedule
✅ Admin can suspend schedule for vacation period
✅ New child added to route appears in driver's trip immediately
✅ Automated trips generate daily at 2 AM
✅ All endpoints return proper error messages
✅ Database maintains referential integrity

## Final Notes

- **Foreign Keys:** All relations MUST have proper FKs with cascades
- **Unique Constraints:** (childId, tripId) on attendance prevents duplicates
- **Indexes:** Add indexes on driverId, tripId, routeId for performance
- **Optional Fields:** Bus.driverId and Child.routeId can be null
- **Status Enums:** Use exact values: ACTIVE, SUSPENDED, SCHEDULED, etc.
- **Time Format:** Store scheduledTime as "HH:mm" string
- **Date Handling:** Always use UTC, convert to local on frontend

---

**AI Builder:** Read this document, then systematically review the codebase. Identify gaps, fix broken logic, and implement missing pieces. Test each flow before moving to the next. Report what you fixed and what's still missing.
