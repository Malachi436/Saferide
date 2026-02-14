# Implementation Prompt: School-Centric Saferide Transportation System

Use this prompt to implement a school-centric school bus transportation system where schools directly manage their own transportation operations.

---

## Project Context

You are building a school bus transportation management system similar to ROSAgo but with a school-centric ownership model:
- **Current (Company-Centric)**: Transport Company -> Multiple Schools -> Routes/Children
- **Target (School-Centric)**: School -> Own Routes, Buses, Drivers -> Collects fees directly from Parents

---

## Phase 1: Database Schema Changes

### 1.1 Update Role Enum

Add `SCHOOL_ADMIN` role to your Prisma schema:

```prisma
enum Role {
  PLATFORM_ADMIN
  COMPANY_ADMIN  // Keep for multi-school transport companies
  SCHOOL_ADMIN   // NEW: School-level administrator
  DRIVER
  PARENT
}
```

### 1.2 Add School-Level Fare to School Model

```prisma
model School {
  id              String    @id @default(uuid())
  name            String
  // School owns its own base fare (not inherited from company)
  baseFare        Int       @default(50000)
  currency        String    @default("UGX")
  // Contact info
  contactEmail    String?
  contactPhone    String?
  address         String?
  latitude        Float?
  longitude       Float?
  // Ownership - optional for transport company model
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  // Relationships
  users           User[]
  children        Child[]
  routes          Route[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([companyId])
}
```

### 1.3 Add School Ownership to Bus Model

```prisma
model Bus {
  id              String    @id @default(uuid())
  plateNumber     String    @unique
  capacity        Int
  // Company ownership (for transport company model)
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  // School ownership (for school-owned model)
  schoolId        String?
  school          School?   @relation(fields: [schoolId], references: [id])
  // Driver assignment
  driverId        String?
  driver          Driver?   @relation(fields: [driverId], references: [id])
  // Relationships
  routes          Route[]
  trips           Trip[]
  scheduledRoutes ScheduledRoute[]
  locations       BusLocation[]
  
  @@index([companyId])
  @@index([schoolId])
}
```

### 1.4 Add FareHistory for Schools (Optional)

```prisma
model FareHistory {
  id         String   @id @default(uuid())
  schoolId   String
  school     School   @relation(fields: [schoolId], references: [id])
  oldFare    Int
  newFare    Int
  changedBy  String
  reason     String?
  createdAt  DateTime @default(now())

  @@index([schoolId])
  @@index([createdAt])
}
```

---

## Phase 2: Authentication & Authorization

### 2.1 Ensure JWT Includes schoolId

Your JWT payload should already include schoolId. Verify it:

```typescript
// In auth.service.ts - login method
async login(user) {
  const payload = {
    email: user.email,
    sub: user.id,
    role: user.role,
    companyId: user.companyId,
    schoolId: user.schoolId  // Ensure this is populated
  };
  return {
    access_token: this.jwtService.sign(payload),
    // ...
  };
}
```

### 2.2 Update RolesGuard to Include SCHOOL_ADMIN

```typescript
// roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    
    // PLATFORM_ADMIN can access everything
    if (user.role === 'PLATFORM_ADMIN') return true;
    
    // SCHOOL_ADMIN can only access their own school
    if (user.role === 'SCHOOL_ADMIN') {
      const schoolId = context.switchToHttp().getRequest().params.schoolId;
      if (schoolId && user.schoolId !== schoolId) return false;
      return true;
    }
    
    return requiredRoles.includes(user.role);
  }
}
```

---

## Phase 3: Create Schools Module

### 3.1 SchoolsController

Create a new controller at `backend/src/modules/schools/schools.controller.ts`:

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('school')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SchoolsController {
  
  @Get('routes')
  @Roles('SCHOOL_ADMIN')
  async getSchoolRoutes(@Req() req: any) {
    const schoolId = req.user.schoolId;
    // Implement in service - returns routes with bus/driver/stops/children count
  }

  @Get('children')
  @Roles('SCHOOL_ADMIN')
  async getSchoolChildren(@Req() req: any) {
    const schoolId = req.user.schoolId;
    // Implement in service - returns children with parent/route info
  }

  @Get('drivers')
  @Roles('SCHOOL_ADMIN')
  async getSchoolDrivers(@Req() req: any) {
    const schoolId = req.user.schoolId;
    // Implement in service - returns drivers with user/buses
  }

  @Get('buses')
  @Roles('SCHOOL_ADMIN')
  async getSchoolBuses(@Req() req: any) {
    const schoolId = req.user.schoolId;
    // Implement in service - returns buses with driver/route count
  }

  @Get('trips')
  @Roles('SCHOOL_ADMIN')
  async getSchoolTrips(@Req() req: any, @Query('date') date?: string) {
    const schoolId = req.user.schoolId;
    // Implement in service - returns trips for the school
  }

  @Post('drivers')
  @Roles('SCHOOL_ADMIN')
  async createDriver(@Req() req: any, @Body() dto: CreateDriverDto) {
    const schoolId = req.user.schoolId;
    // Creates user with DRIVER role + schoolId, then creates Driver record
  }

  @Post('buses')
  @Roles('SCHOOL_ADMIN')
  async createBus(@Req() req: any, @Body() dto: CreateBusDto) {
    const schoolId = req.user.schoolId;
    // Creates bus with schoolId
  }

  @Post('routes')
  @Roles('SCHOOL_ADMIN')
  async createRoute(@Req() req: any, @Body() dto: CreateRouteDto) {
    const schoolId = req.user.schoolId;
    // Creates route with schoolId and stops
  }

  @Post('scheduled-routes')
  @Roles('SCHOOL_ADMIN')
  async createScheduledRoute(@Req() req: any, @Body() dto: CreateScheduledRouteDto) {
    const schoolId = req.user.schoolId;
    // Creates scheduled route for recurring trips
  }

  @Post('children/bulk-onboard')
  @Roles('SCHOOL_ADMIN')
  async bulkOnboardChildren(@Req() req: any, @Body() dto: BulkOnboardDto) {
    const schoolId = req.user.schoolId;
    // Bulk creates children with optional route assignment
  }

  @Get('analytics')
  @Roles('SCHOOL_ADMIN')
  async getSchoolAnalytics(@Req() req: any, @Query('range') range?: string) {
    const schoolId = req.user.schoolId;
    // Returns: totalTrips, completedTrips, totalChildren, activeChildren, attendanceRecords, missedPickups, onTimeRate
  }

  @Patch('fare')
  @Roles('SCHOOL_ADMIN')
  async updateFare(@Req() req: any, @Body() dto: UpdateFareDto) {
    const schoolId = req.user.schoolId;
    // Updates school baseFare and creates fare history
  }
}
```

### 3.2 SchoolsService

Create `backend/src/modules/schools/schools.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchoolsService {
  constructor(private prisma: PrismaService) {}

  async getRoutes(schoolId: string) {
    return this.prisma.route.findMany({
      where: { schoolId },
      include: {
        bus: { include: { driver: { include: { user: true } } } },
        stops: { orderBy: { order: 'asc' } },
        _count: { select: { children: true } }
      }
    });
  }

  async getChildren(schoolId: string) {
    return this.prisma.child.findMany({
      where: { schoolId },
      include: {
        parent: true,
        route: { include: { bus: true } },
        school: true
      }
    });
  }

  async getDrivers(schoolId: string) {
    return this.prisma.driver.findMany({
      where: {
        OR: [
          { user: { schoolId } },
          { buses: { some: { schoolId } } }
        ]
      },
      include: {
        user: true,
        buses: true
      }
    });
  }

  async getBuses(schoolId: string) {
    return this.prisma.bus.findMany({
      where: { schoolId },
      include: {
        driver: { include: { user: true } },
        _count: { select: { routes: true } }
      }
    });
  }

  async getTrips(schoolId: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    return this.prisma.trip.findMany({
      where: {
        route: { schoolId },
        startTime: { gte: startOfDay, lte: endOfDay }
      },
      include: {
        route: true,
        bus: true,
        driver: { include: { user: true } },
        attendances: { include: { child: true } }
      },
      orderBy: { startTime: 'asc' }
    });
  }

  async createDriver(schoolId: string, dto: any) {
    // Hash password
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        role: 'DRIVER',
        schoolId
      }
    });

    return this.prisma.driver.create({
      data: {
        license: dto.license,
        userId: user.id
      },
      include: { user: true }
    });
  }

  async createBus(schoolId: string, dto: any) {
    return this.prisma.bus.create({
      data: {
        plateNumber: dto.plateNumber,
        capacity: dto.capacity,
        schoolId
      }
    });
  }

  async createRoute(schoolId: string, dto: any) {
    return this.prisma.route.create({
      data: {
        name: dto.name,
        schoolId,
        busId: dto.busId,
        shift: dto.shift,
        stops: {
          create: dto.stops.map((stop, index) => ({
            name: stop.name,
            latitude: stop.latitude,
            longitude: stop.longitude,
            order: index + 1
          }))
        }
      },
      include: { stops: true }
    });
  }

  async bulkOnboardChildren(schoolId: string, dto: any) {
    const createdChildren = await this.prisma.$transaction(
      dto.children.map((childData: any) => 
        this.prisma.child.create({
          data: {
            firstName: childData.firstName,
            lastName: childData.lastName,
            dateOfBirth: new Date(childData.dateOfBirth),
            grade: childData.grade,
            schoolId,
            parentPhone: childData.parentPhone,
            routeId: childData.routeId || null,
            daysUntilPayment: childData.daysUntilPayment || 0,
            uniqueCode: this.generateUniqueCode(),
            isClaimed: false,
            pickupType: 'SCHOOL'
          }
        })
      )
    );
    return { created: createdChildren.length, children: createdChildren };
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  async getAnalytics(schoolId: string, range?: string) {
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [totalTrips, completedTrips, totalChildren, activeChildren, 
            missedPickups] = await Promise.all([
      this.prisma.trip.count({
        where: { route: { schoolId }, createdAt: { gte: startDate } }
      }),
      this.prisma.trip.count({
        where: { route: { schoolId }, status: 'COMPLETED', createdAt: { gte: startDate } }
      }),
      this.prisma.child.count({ where: { schoolId } }),
      this.prisma.child.count({
        where: { 
          schoolId,
          attendance: { some: { trip: { status: 'IN_PROGRESS' } } }
        }
      }),
      this.prisma.childAttendance.count({
        where: { 
          child: { schoolId }, 
          status: 'MISSED',
          createdAt: { gte: startDate } 
        }
      })
    ]);

    return {
      totalTrips,
      completedTrips,
      totalChildren,
      activeChildren,
      missedPickups,
      onTimeRate: totalTrips > 0 ? ((completedTrips / totalTrips) * 100).toFixed(2) : 0
    };
  }

  async updateFare(schoolId: string, newFare: number, changedBy: string, reason?: string) {
    const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
    const oldFare = school.baseFare;
    
    const updated = await this.prisma.school.update({
      where: { id: schoolId },
      data: { baseFare: newFare }
    });

    // Create fare history
    await this.prisma.fareHistory.create({
      data: {
        schoolId,
        oldFare,
        newFare,
        changedBy,
        reason
      }
    });

    return updated;
  }
}
```

---

## Phase 4: DTOs for Schools Module

Create `backend/src/modules/schools/dto/schools.dto.ts`:

```typescript
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEmail, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  license: string;
}

export class CreateBusDto {
  @IsString()
  plateNumber: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  capacity: number;
}

export class StopDto {
  @IsString()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  busId?: string;

  @IsString()
  @IsOptional()
  shift?: string; // "MORNING" or "AFTERNOON"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops: StopDto[];
}

export class CreateScheduledRouteDto {
  @IsString()
  routeId: string;

  @IsString()
  driverId: string;

  @IsString()
  busId: string;

  @IsString()
  scheduledTime: string; // "07:00"

  @IsArray()
  recurringDays: string[]; // ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

  @IsOptional()
  autoAssignChildren?: boolean;

  @IsOptional()
  effectiveFrom?: Date;

  @IsOptional()
  effectiveUntil?: Date;
}

export class ChildDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsNumber()
  @IsOptional()
  daysUntilPayment?: number;

  @IsString()
  @IsOptional()
  routeId?: string;
}

export class BulkOnboardDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children: ChildDto[];
}

export class UpdateFareDto {
  @IsNumber()
  @Min(0)
  newFare: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
```

---

## Phase 5: Frontend - School Admin Dashboard

### 5.1 API Service Updates

Add school-scoped API methods:

```typescript
// frontend/src/services/api.ts

export const schoolApi = {
  getRoutes: (schoolId: string) => 
    apiClient.get(`/school/routes`),
  
  getChildren: (schoolId: string) => 
    apiClient.get(`/school/children`),
  
  getDrivers: (schoolId: string) => 
    apiClient.get(`/school/drivers`),
  
  getBuses: (schoolId: string) => 
    apiClient.get(`/school/buses`),
  
  getTrips: (schoolId: string, date?: string) => 
    apiClient.get(`/school/trips`, { params: { date } }),
  
  getAnalytics: (schoolId: string, range?: string) => 
    apiClient.get(`/school/analytics`, { params: { range } }),
  
  createDriver: (data: CreateDriverDto) => 
    apiClient.post('/school/drivers', data),
  
  createBus: (data: CreateBusDto) => 
    apiClient.post('/school/buses', data),
  
  createRoute: (data: CreateRouteDto) => 
    apiClient.post('/school/routes', data),
  
  bulkOnboard: (data: BulkOnboardDto) => 
    apiClient.post('/school/children/bulk-onboard', data),
  
  updateFare: (newFare: number, reason?: string) => 
    apiClient.patch('/school/fare', { newFare, reason }),
};
```

### 5.2 Login Redirect Logic

```typescript
// frontend/src/app/login/page.tsx (or your auth context)

const handleLogin = async (credentials) => {
  const response = await login(credentials);
  const { role, schoolId, companyId } = response.user;
  
  switch (role) {
    case 'PLATFORM_ADMIN':
      navigate('/platform/dashboard');
      break;
    case 'COMPANY_ADMIN':
      navigate(`/company/${companyId}/dashboard`);
      break;
    case 'SCHOOL_ADMIN':
      navigate(`/school/${schoolId}/dashboard`);
      break;
    case 'DRIVER':
      navigate('/driver/home');
      break;
    case 'PARENT':
      navigate('/parent/home');
      break;
  }
};
```

### 5.3 Sidebar Navigation

```typescript
// frontend/src/components/Sidebar.tsx

const getNavLinks = (role: string) => {
  switch (role) {
    case 'SCHOOL_ADMIN':
      return [
        { href: '/school/:schoolId/dashboard', label: 'Dashboard', icon: HomeIcon },
        { href: '/school/:schoolId/children', label: 'Children', icon: UsersIcon },
        { href: '/school/:schoolId/routes', label: 'Routes', icon: RouteIcon },
        { href: '/school/:schoolId/drivers', label: 'Drivers', icon: CarIcon },
        { href: '/school/:schoolId/buses', label: 'Buses', icon: BusIcon },
        { href: '/school/:schoolId/trips', label: 'Trips', icon: CalendarIcon },
        { href: '/school/:schoolId/analytics', label: 'Analytics', icon: ChartIcon },
        { href: '/school/:schoolId/settings', label: 'Settings', icon: SettingsIcon },
      ];
    // ... other roles
  }
};
```

---

## Phase 6: API Endpoint Summary

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/school/routes` | SCHOOL_ADMIN | Get all routes for school |
| GET | `/school/children` | SCHOOL_ADMIN | Get all children for school |
| GET | `/school/drivers` | SCHOOL_ADMIN | Get all drivers for school |
| GET | `/school/buses` | SCHOOL_ADMIN | Get all buses for school |
| GET | `/school/trips` | SCHOOL_ADMIN | Get trips (optional date param) |
| GET | `/school/analytics` | SCHOOL_ADMIN | Get school analytics (range param) |
| POST | `/school/drivers` | SCHOOL_ADMIN | Create new driver |
| POST | `/school/buses` | SCHOOL_ADMIN | Create new bus |
| POST | `/school/routes` | SCHOOL_ADMIN | Create new route |
| POST | `/school/scheduled-routes` | SCHOOL_ADMIN | Create scheduled route |
| POST | `/school/children/bulk-onboard` | SCHOOL_ADMIN | Bulk onboard children |
| PATCH | `/school/fare` | SCHOOL_ADMIN | Update school fare |

---

## Phase 7: Key Implementation Notes

### 7.1 Data Isolation
- Always filter queries by `schoolId` from `req.user.schoolId`
- Never trust the schoolId from request params alone - verify ownership

### 7.2 Trip Generation (No Changes Needed)
The existing trip generation already works at route level which is already school-scoped. Just ensure `route.schoolId` is properly set.

### 7.3 Parent App (No Changes Needed)
The parent-facing app should work without changes - children already have `schoolId` and the parent linking flow remains the same.

### 7.4 Driver App
Drivers should see trips based on their assignments (via bus -> scheduled route -> route -> school).

---

## Testing Checklist

1. **School Admin Login**
   - [ ] Login as SCHOOL_ADMIN
   - [ ] Verify can only access own school data

2. **CRUD Operations**
   - [ ] Create driver, bus, route
   - [ ] View all children
   - [ ] Bulk onboard children via CSV

3. **Trip Management**
   - [ ] Create scheduled routes
   - [ ] Generate trips manually
   - [ ] View trip history

4. **Analytics**
   - [ ] View dashboard stats
   - [ ] Filter by date range

5. **Data Isolation**
   - [ ] Login as School A admin
   - [ ] Try to access School B data
   - [ ] Verify access denied
