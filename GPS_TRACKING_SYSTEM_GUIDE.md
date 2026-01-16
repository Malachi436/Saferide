# GPS Tracking & Real-Time Location System Replication Guide

## System Overview
Real-time GPS tracking system that allows drivers to broadcast location, parents to track buses, and admin dashboard to monitor all active vehicles. Uses WebSocket for real-time updates with REST fallback.

## Technology Stack
- **Real-Time:** Socket.IO (WebSocket) for live updates
- **Storage:** Redis for fast location caching
- **Database:** PostgreSQL (Prisma) for persistent storage
- **Frontend:** React Native (mobile), Next.js (admin dashboard)

## Core Database Models

### BusLocation Model
```prisma
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

### Related Models
```prisma
model Trip {
  id          String      @id @default(uuid())
  busId       String
  bus         Bus         @relation(fields: [busId], references: [id])
  routeId     String
  route       Route       @relation(fields: [routeId], references: [id])
  driverId    String
  driver      Driver      @relation(fields: [driverId], references: [id])
  status      TripStatus  @default(SCHEDULED)
  startTime   DateTime?
  endTime     DateTime?
  attendances ChildAttendance[]
}

model Child {
  id              String   @id @default(uuid())
  firstName       String
  lastName        String
  homeLatitude    Float?
  homeLongitude   Float?
  homeAddress     String?
  routeId         String?
  route           Route?   @relation(fields: [routeId], references: [id])
}

model School {
  id        String  @id @default(uuid())
  name      String
  latitude  Float?
  longitude Float?
}
```

## Complete GPS Tracking Flow

### Flow 1: Driver Broadcasts Location (Every 5 Seconds)

**Driver Mobile App Logic:**
```typescript
// Driver app: src/services/gpsService.ts
import * as Location from 'expo-location';
import { socketService } from './socket';

let watchSubscription: Location.LocationSubscription | null = null;

async function startGPSTracking(tripId: string, busId: string) {
  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied');
  }

  // Start watching location
  watchSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,     // Update every 5 seconds
      distanceInterval: 10    // Or every 10 meters
    },
    (location) => {
      const gpsData = {
        busId: busId,
        tripId: tripId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed || 0,
        timestamp: new Date().toISOString()
      };

      // Send via WebSocket (primary)
      socketService.emit('gps_update', gpsData);

      // Also send via REST (fallback/redundancy)
      sendGPSHeartbeat(gpsData);
    }
  );
}

async function sendGPSHeartbeat(gpsData) {
  try {
    await apiClient.post('/gps/heartbeat', gpsData);
  } catch (error) {
    console.error('GPS heartbeat failed:', error);
  }
}

function stopGPSTracking() {
  if (watchSubscription) {
    watchSubscription.remove();
    watchSubscription = null;
  }
}
```

**Backend GPS Heartbeat Endpoint:**
```typescript
// backend/src/modules/gps/gps.controller.ts
@Controller('gps')
export class GpsController {
  constructor(
    private gpsService: GpsService,
    private realtimeGateway: RealtimeGateway
  ) {}

  @Post('heartbeat')
  async receiveHeartbeat(@Body() dto: GpsHeartbeatDto) {
    // Validate data
    if (!dto.busId || !dto.latitude || !dto.longitude) {
      throw new BadRequestException('Missing required GPS data');
    }

    // Store in PostgreSQL
    const location = await this.gpsService.saveLocation({
      busId: dto.busId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed || 0,
      timestamp: new Date(dto.timestamp || Date.now())
    });

    // Cache in Redis (TTL 5 minutes)
    await this.gpsService.cacheLocation(dto.busId, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      timestamp: dto.timestamp
    });

    // Broadcast to WebSocket subscribers
    this.realtimeGateway.broadcastGPSUpdate(dto.busId, {
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      timestamp: dto.timestamp,
      busId: dto.busId
    });

    return { success: true, location };
  }
}
```

**GPS Service Implementation:**
```typescript
// backend/src/modules/gps/gps.service.ts
@Injectable()
export class GpsService {
  constructor(
    private prisma: PrismaService,
    @Inject('REDIS') private redis: Redis
  ) {}

  async saveLocation(data: {
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: Date;
  }) {
    return this.prisma.busLocation.create({
      data
    });
  }

  async cacheLocation(busId: string, data: any) {
    const key = `bus:location:${busId}`;
    await this.redis.setex(key, 300, JSON.stringify(data)); // 5 min TTL
  }

  async getCachedLocation(busId: string) {
    const key = `bus:location:${busId}`;
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async getLatestLocation(busId: string) {
    // Try Redis first (fast)
    const cached = await this.getCachedLocation(busId);
    if (cached) return cached;

    // Fallback to database
    return this.prisma.busLocation.findFirst({
      where: { busId },
      orderBy: { timestamp: 'desc' }
    });
  }

  async getLocationHistory(busId: string, startTime: Date, endTime: Date) {
    return this.prisma.busLocation.findMany({
      where: {
        busId,
        timestamp: {
          gte: startTime,
          lte: endTime
        }
      },
      orderBy: { timestamp: 'asc' }
    });
  }
}
```

### Flow 2: WebSocket Real-Time Broadcasting

**WebSocket Gateway:**
```typescript
// backend/src/modules/realtime/realtime.gateway.ts
@WebSocketGateway({
  cors: { origin: '*' },
  transports: ['websocket', 'polling']
})
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('RealtimeGateway');

  // Client joins bus tracking room
  @SubscribeMessage('join_bus_room')
  handleJoinBusRoom(client: Socket, busId: string) {
    client.join(`bus:${busId}`);
    this.logger.log(`Client ${client.id} joined bus:${busId}`);
  }

  // Client joins company-wide room (admin dashboard)
  @SubscribeMessage('join_company_room')
  handleJoinCompanyRoom(client: Socket, companyId: string) {
    client.join(`company:${companyId}`);
    this.logger.log(`Client ${client.id} joined company:${companyId}`);
  }

  // Broadcast GPS update to specific bus subscribers
  broadcastGPSUpdate(busId: string, data: any) {
    this.server.to(`bus:${busId}`).emit('location_update', {
      busId,
      ...data
    });
  }

  // Broadcast to entire company (admin dashboard)
  broadcastToCompany(companyId: string, event: string, data: any) {
    this.server.to(`company:${companyId}`).emit(event, data);
  }

  // Driver sends GPS via WebSocket
  @SubscribeMessage('gps_update')
  async handleGPSUpdate(client: Socket, data: {
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
  }) {
    // Broadcast to all subscribers of this bus
    this.broadcastGPSUpdate(data.busId, data);

    // Also cache in Redis
    await this.cacheGPSData(data);
  }

  private async cacheGPSData(data: any) {
    // Inject Redis service or use direct connection
  }
}
```

### Flow 3: Parent Mobile App Tracking

**Parent App Location Subscription:**
```typescript
// Parent app: src/screens/LiveTrackingScreen.tsx
import { useEffect, useState } from 'react';
import { socketService } from '../utils/socket';
import MapView, { Marker } from 'react-native-maps';

export default function LiveTrackingScreen({ childId }) {
  const [busLocation, setBusLocation] = useState(null);
  const [childData, setChildData] = useState(null);
  const [schoolLocation, setSchoolLocation] = useState(null);

  useEffect(() => {
    // Fetch child data (includes trip, bus, route, school)
    loadChildTripData();

    // Connect to WebSocket
    socketService.connect();

    // Subscribe to bus location updates
    socketService.on('location_update', handleLocationUpdate);

    return () => {
      socketService.off('location_update', handleLocationUpdate);
    };
  }, [childId]);

  async function loadChildTripData() {
    try {
      const response = await apiClient.get(`/trips/child/${childId}`);
      const trip = response[0]; // Today's trip
      
      if (trip) {
        setChildData({
          child: trip.child,
          bus: trip.bus,
          route: trip.route,
          school: trip.route.school
        });

        setSchoolLocation({
          latitude: trip.route.school.latitude,
          longitude: trip.route.school.longitude
        });

        // Join WebSocket room for this bus
        socketService.emit('join_bus_room', trip.bus.id);

        // Fetch initial bus location (REST fallback)
        const location = await apiClient.get(`/gps/location/${trip.bus.id}`);
        if (location) {
          setBusLocation({
            latitude: location.latitude,
            longitude: location.longitude
          });
        }
      }
    } catch (error) {
      console.error('Failed to load trip data:', error);
    }
  }

  function handleLocationUpdate(data) {
    if (data.busId === childData?.bus.id) {
      setBusLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        speed: data.speed
      });
    }
  }

  return (
    <MapView
      initialRegion={{
        latitude: childData?.child.homeLatitude || 0,
        longitude: childData?.child.homeLongitude || 0,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }}
    >
      {/* Child home location */}
      {childData?.child.homeLatitude && (
        <Marker
          coordinate={{
            latitude: childData.child.homeLatitude,
            longitude: childData.child.homeLongitude
          }}
          title="Home"
          pinColor="blue"
        />
      )}

      {/* School location */}
      {schoolLocation && (
        <Marker
          coordinate={schoolLocation}
          title={childData.school.name}
          pinColor="green"
        />
      )}

      {/* Live bus location */}
      {busLocation && (
        <Marker
          coordinate={busLocation}
          title={`Bus ${childData.bus.plateNumber}`}
          pinColor="orange"
        >
          <Image source={require('../assets/bus-icon.png')} />
        </Marker>
      )}
    </MapView>
  );
}
```

### Flow 4: Admin Dashboard Live Tracking

**Admin Dashboard Live Map:**
```typescript
// admin-web/src/app/company/[companyId]/live-dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { apiClient } from '@/lib/api-client';
import { ROSAgoMap } from '@/components/ROSAgoMap';

export default function LiveDashboardPage({ params }) {
  const companyId = params.companyId;
  const [activeTrips, setActiveTrips] = useState([]);
  const [busLocations, setBusLocations] = useState({}); // { busId: location }
  const [schools, setSchools] = useState([]);
  const [pickups, setPickups] = useState([]);
  
  const { socket, connected } = useSocket();

  useEffect(() => {
    fetchActiveTrips();
    fetchSchools();
    fetchPickups();

    // Join company room for all updates
    if (connected && socket) {
      socket.emit('join_company_room', companyId);
    }

    // Listen for GPS updates
    socket?.on('location_update', handleLocationUpdate);

    // Fallback polling if WebSocket disconnected
    const interval = setInterval(() => {
      if (!connected) {
        fetchActiveTrips();
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(interval);
      socket?.off('location_update', handleLocationUpdate);
    };
  }, [companyId, connected]);

  async function fetchActiveTrips() {
    try {
      const trips = await apiClient.get(`/trips/company/${companyId}/active`);
      setActiveTrips(trips);

      // Fetch latest location for each bus (REST fallback)
      const locations = {};
      for (const trip of trips) {
        try {
          const location = await apiClient.get(`/gps/location/${trip.bus.id}`);
          if (location) {
            locations[trip.bus.id] = {
              latitude: location.latitude,
              longitude: location.longitude,
              timestamp: location.timestamp,
              plateNumber: trip.bus.plateNumber,
              driverName: trip.bus.driver?.user 
                ? `${trip.bus.driver.user.firstName} ${trip.bus.driver.user.lastName}` 
                : 'No driver'
            };
          }
        } catch (err) {
          console.log(`No location for bus ${trip.bus.id}`);
        }
      }
      setBusLocations(locations);
    } catch (error) {
      console.error('Failed to fetch active trips:', error);
    }
  }

  async function fetchSchools() {
    try {
      const schools = await apiClient.get(`/admin/company/${companyId}/schools`);
      setSchools(schools.filter(s => s.latitude && s.longitude));
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  }

  async function fetchPickups() {
    try {
      const children = await apiClient.get(`/admin/company/${companyId}/children`);
      const pickupList = children
        .filter(child => child.homeLatitude && child.homeLongitude)
        .map(child => ({
          childId: child.id,
          childName: `${child.firstName} ${child.lastName}`,
          latitude: child.homeLatitude,
          longitude: child.homeLongitude
        }));
      setPickups(pickupList);
    } catch (error) {
      console.error('Failed to fetch pickups:', error);
    }
  }

  function handleLocationUpdate(data) {
    setBusLocations(prev => ({
      ...prev,
      [data.busId]: {
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: data.timestamp,
        plateNumber: prev[data.busId]?.plateNumber,
        driverName: prev[data.busId]?.driverName
      }
    }));
  }

  return (
    <div className="max-w-7xl">
      <h1 className="text-3xl font-bold mb-8">Live Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Active Trips" 
          value={activeTrips.length} 
        />
        <StatCard 
          label="Buses Tracking" 
          value={Object.keys(busLocations).length} 
        />
        <StatCard 
          label="Connection" 
          value={connected ? 'Live' : 'Polling'} 
          color={connected ? 'green' : 'red'}
        />
      </div>

      {/* Live Map */}
      <ROSAgoMap
        busLocations={busLocations}
        schools={schools.map(s => ({
          id: s.id,
          name: s.name,
          latitude: s.latitude,
          longitude: s.longitude
        }))}
        pickups={pickups}
        height="600px"
      />

      {/* Active Trips List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Active Routes</h2>
        <div className="space-y-4">
          {activeTrips.map(trip => (
            <TripCard 
              key={trip.id}
              trip={trip}
              location={busLocations[trip.bus.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Complete API Endpoints

### GPS Tracking Endpoints
```
POST   /gps/heartbeat                     - Driver sends location update
GET    /gps/location/:busId               - Get latest bus location
GET    /gps/locations/:busId              - Get location history
  Query: ?startTime=ISO8601&endTime=ISO8601
```

### Trip-Related Endpoints (for GPS context)
```
GET    /trips/child/:childId              - Get child's trips (for parent tracking)
GET    /trips/company/:companyId/active   - Get all active trips (for admin dashboard)
GET    /drivers/:driverId/today-trip      - Get driver's trip (includes bus for GPS)
```

### Real-Time Subscription Endpoints
```
GET    /admin/company/:companyId/schools  - Get schools with coordinates
GET    /admin/company/:companyId/children - Get children with home coordinates
```

## WebSocket Events

### Client → Server Events
```typescript
// Join bus tracking room
socket.emit('join_bus_room', busId);

// Join company-wide room (admin)
socket.emit('join_company_room', companyId);

// Driver sends GPS update
socket.emit('gps_update', {
  busId: string,
  latitude: number,
  longitude: number,
  speed: number,
  timestamp: string
});
```

### Server → Client Events
```typescript
// Real-time location broadcast
socket.on('location_update', (data: {
  busId: string,
  latitude: number,
  longitude: number,
  speed: number,
  timestamp: string
}) => {
  // Update map marker
});

// Attendance marked (triggers notification)
socket.on('attendance_change', (data: {
  childId: string,
  tripId: string,
  status: 'PICKED_UP' | 'DROPPED' | 'MISSED',
  timestamp: string
}) => {
  // Update UI, show notification
});

// Trip status changed
socket.on('trip_status_change', (data: {
  tripId: string,
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED',
  timestamp: string
}) => {
  // Update trip list
});
```

## Security & Access Control

### Parent Access Restrictions
```typescript
// backend/src/modules/trips/trips.controller.ts
@Get('child/:childId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PARENT')
async getChildTrips(
  @Param('childId') childId: string,
  @Req() req
) {
  // Verify parent owns this child
  const child = await this.prisma.child.findUnique({
    where: { id: childId },
    include: { parent: true }
  });

  if (child.parentId !== req.user.userId) {
    throw new ForbiddenException('Not your child');
  }

  // Return only active/today trips
  return this.tripsService.getChildTrips(childId);
}
```

### GPS Data Privacy
```typescript
// Only show bus location if trip is active
async getLatestLocation(busId: string, requestUserId: string) {
  // Check if bus has active trip
  const activeTrip = await this.prisma.trip.findFirst({
    where: {
      busId,
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
    }
  });

  if (!activeTrip) {
    throw new NotFoundException('Bus not currently active');
  }

  // Verify user has permission (parent with child on trip, or admin)
  const hasAccess = await this.verifyAccess(activeTrip.id, requestUserId);
  if (!hasAccess) {
    throw new ForbiddenException('Access denied');
  }

  return this.getLatestLocation(busId);
}
```

## Map Component Implementation

### React Native Map (Parent App)
```typescript
// Parent app: src/components/LiveMap.tsx
import MapView, { Marker, Polyline } from 'react-native-maps';

interface LiveMapProps {
  busLocation: { latitude: number; longitude: number };
  childHome: { latitude: number; longitude: number };
  school: { latitude: number; longitude: number };
  route?: { latitude: number; longitude: number }[];
}

export function LiveMap({ busLocation, childHome, school, route }: LiveMapProps) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: childHome.latitude,
        longitude: childHome.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05
      }}
    >
      {/* Child home */}
      <Marker
        coordinate={childHome}
        title="Home"
        pinColor="blue"
      />

      {/* School */}
      <Marker
        coordinate={school}
        title="School"
        pinColor="green"
      />

      {/* Live bus */}
      <Marker
        coordinate={busLocation}
        title="Bus"
        pinColor="orange"
      />

      {/* Route path (if available) */}
      {route && (
        <Polyline
          coordinates={route}
          strokeColor="blue"
          strokeWidth={3}
        />
      )}
    </MapView>
  );
}
```

### Next.js Map (Admin Dashboard)
```typescript
// admin-web/src/components/ROSAgoMap.tsx
'use client';

import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then(mod => mod.Marker),
  { ssr: false }
);

interface BusLocation {
  latitude: number;
  longitude: number;
  plateNumber: string;
  driverName: string;
}

interface ROSAgoMapProps {
  busLocations: { [busId: string]: BusLocation };
  schools: { id: string; name: string; latitude: number; longitude: number }[];
  pickups: { childId: string; childName: string; latitude: number; longitude: number }[];
  height?: string;
}

export function ROSAgoMap({ busLocations, schools, pickups, height = '500px' }: ROSAgoMapProps) {
  const center = schools[0] 
    ? [schools[0].latitude, schools[0].longitude] 
    : [0.3476, 32.5825]; // Default: Kampala

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Bus markers (orange) */}
        {Object.entries(busLocations).map(([busId, location]) => (
          <Marker
            key={busId}
            position={[location.latitude, location.longitude]}
            title={`${location.plateNumber} - ${location.driverName}`}
          />
        ))}

        {/* School markers (green) */}
        {schools.map(school => (
          <Marker
            key={school.id}
            position={[school.latitude, school.longitude]}
            title={school.name}
          />
        ))}

        {/* Pickup markers (blue) */}
        {pickups.map(pickup => (
          <Marker
            key={pickup.childId}
            position={[pickup.latitude, pickup.longitude]}
            title={pickup.childName}
          />
        ))}
      </MapContainer>
    </div>
  );
}
```

## ETA Calculation (Optional Enhancement)

### Calculate ETA to Child Pickup
```typescript
// backend/src/modules/gps/gps.service.ts
async calculateETA(busId: string, targetLat: number, targetLng: number) {
  const busLocation = await this.getLatestLocation(busId);
  if (!busLocation) {
    throw new NotFoundException('Bus location not available');
  }

  // Calculate distance (Haversine formula)
  const distance = this.calculateDistance(
    busLocation.latitude,
    busLocation.longitude,
    targetLat,
    targetLng
  );

  // Estimate time based on average speed (or current speed)
  const avgSpeed = busLocation.speed > 0 ? busLocation.speed : 30; // km/h
  const etaMinutes = (distance / avgSpeed) * 60;

  return {
    distanceKm: distance,
    etaMinutes: Math.round(etaMinutes),
    currentSpeed: busLocation.speed
  };
}

private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = this.toRad(lat2 - lat1);
  const dLon = this.toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

private toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

## Common Issues & Solutions

### Issue 1: Location Not Updating
**Symptoms:** Map shows stale or no location
**Check:**
- Is driver app sending heartbeats? Check logs
- Is WebSocket connected? Check connection status
- Is Redis running? GPS cached here
- Is busId correct in requests?

**Fix:**
```typescript
// Check WebSocket connection
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));

// Force REST fallback
const location = await apiClient.get(`/gps/location/${busId}`);
```

### Issue 2: Permission Denied on Location Access
**Symptoms:** Driver can't start GPS tracking
**Fix:**
```typescript
// Request permissions properly
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  Alert.alert('Permission Required', 'GPS tracking needs location access');
  return;
}

// For background tracking (optional)
await Location.requestBackgroundPermissionsAsync();
```

### Issue 3: High Battery Drain
**Symptoms:** Driver app drains battery quickly
**Fix:**
```typescript
// Reduce update frequency for non-critical trips
Location.watchPositionAsync({
  accuracy: Location.Accuracy.Balanced, // Not High
  timeInterval: 10000, // 10 seconds instead of 5
  distanceInterval: 50  // 50 meters instead of 10
}, callback);
```

### Issue 4: Parent Can't See Bus
**Symptoms:** Parent map shows no bus marker
**Check:**
- Does child have active trip today?
- Is trip status IN_PROGRESS?
- Is bus sending GPS updates?
- Is parent subscribed to correct busId?

**Fix:**
```typescript
// Verify trip exists and is active
const trips = await apiClient.get(`/trips/child/${childId}`);
if (trips.length === 0) {
  Alert.alert('No Trip', 'No active trip for today');
  return;
}

// Join correct bus room
const busId = trips[0].bus.id;
socket.emit('join_bus_room', busId);
```

### Issue 5: WebSocket Disconnects Frequently
**Symptoms:** Connection status flips between Live and Polling
**Fix:**
```typescript
// Implement reconnection logic
socket.on('disconnect', () => {
  console.log('Socket disconnected, reconnecting...');
  setTimeout(() => {
    socket.connect();
  }, 1000);
});

// Enable polling transport as fallback
const socket = io('http://backend:3000', {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

## Testing Checklist

### Phase 1: GPS Heartbeat
- [ ] Driver can start GPS tracking
- [ ] POST /gps/heartbeat receives data every 5 seconds
- [ ] Location stored in PostgreSQL BusLocation table
- [ ] Location cached in Redis with 5-minute TTL
- [ ] GET /gps/location/:busId returns latest location

### Phase 2: WebSocket Broadcasting
- [ ] WebSocket server accepts connections
- [ ] Client can join bus room
- [ ] GPS updates broadcast to room subscribers
- [ ] Multiple clients receive same update
- [ ] Disconnect/reconnect works properly

### Phase 3: Parent Tracking
- [ ] Parent can fetch child's trip
- [ ] Parent sees bus, home, and school markers
- [ ] Bus marker updates in real-time
- [ ] Map centers properly on locations
- [ ] No access to other parents' children

### Phase 4: Admin Dashboard
- [ ] Admin sees all active trips
- [ ] Multiple bus markers on map
- [ ] School and pickup locations shown
- [ ] Stats update in real-time
- [ ] WebSocket connection indicator works

### Phase 5: Security
- [ ] Parent can't access other children's trips
- [ ] GPS data hidden after trip completes
- [ ] JWT authentication required on all endpoints
- [ ] WebSocket connections authenticated
- [ ] Rate limiting on GPS heartbeat endpoint

## Performance Optimization

### Redis Caching Strategy
```typescript
// Cache latest location with short TTL
await redis.setex(`bus:location:${busId}`, 300, JSON.stringify(location));

// Cache trip data with longer TTL
await redis.setex(`trip:${tripId}`, 3600, JSON.stringify(trip));

// Batch fetch multiple bus locations
const locations = await redis.mget(
  busIds.map(id => `bus:location:${id}`)
);
```

### Database Query Optimization
```typescript
// Use indexes on busId and timestamp
@@index([busId, timestamp(desc)])

// Limit location history queries
await prisma.busLocation.findMany({
  where: { busId, timestamp: { gte: startTime } },
  orderBy: { timestamp: 'desc' },
  take: 100 // Limit results
});

// Clean up old location data (run daily)
await prisma.busLocation.deleteMany({
  where: {
    timestamp: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // 7 days
  }
});
```

### WebSocket Room Management
```typescript
// Use specific rooms to avoid broadcasting to everyone
socket.join(`bus:${busId}`);          // Only this bus
socket.join(`company:${companyId}`);  // All company buses

// Emit to specific rooms only
io.to(`bus:${busId}`).emit('location_update', data);

// Leave rooms when done
socket.leave(`bus:${busId}`);
```

## Success Criteria

✅ Driver app sends GPS updates every 5 seconds
✅ Parent sees live bus movement on map
✅ Admin dashboard shows all active buses
✅ WebSocket updates occur in <1 second
✅ REST fallback works when WebSocket fails
✅ Location data persists in database
✅ Redis caching reduces database load
✅ Security prevents unauthorized access
✅ Map performance smooth with 20+ markers
✅ Battery drain acceptable (<5% per hour)

## Key Files to Review

```
backend/
├── src/modules/
│   ├── gps/
│   │   ├── gps.controller.ts       - POST /gps/heartbeat
│   │   ├── gps.service.ts          - Location storage & caching
│   │   └── dto/gps.dto.ts          - GPS data validation
│   ├── realtime/
│   │   └── realtime.gateway.ts     - WebSocket handling
│   └── trips/
│       └── trips.controller.ts     - GET /trips/child/:id
frontend/ (React Native)
├── src/
│   ├── services/
│   │   ├── gpsService.ts           - Location tracking
│   │   └── socket.ts               - WebSocket client
│   └── screens/
│       └── LiveTrackingScreen.tsx  - Parent map view
admin-web/ (Next.js)
├── src/
│   ├── app/company/[companyId]/
│   │   └── live-dashboard/
│   │       └── page.tsx            - Admin dashboard
│   ├── components/
│   │   └── ROSAgoMap.tsx           - Map component
│   └── hooks/
│       └── useSocket.ts            - WebSocket hook
```

---

**AI Builder:** Review the existing implementation, verify WebSocket setup, test GPS flow end-to-end, and fix any gaps in real-time updates or security.
