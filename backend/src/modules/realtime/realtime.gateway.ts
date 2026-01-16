import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket', 'polling'],
  pingInterval: 25000,  // Send ping every 25 seconds
  pingTimeout: 60000,   // Wait 60 seconds for pong response
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly redis: Redis;
  private readonly connectedUsers = new Map<string, string>(); // socketId -> userId
  private readonly gpsHeartbeatCounter = new Map<string, number>(); // busId -> heartbeat count
  private readonly HEARTBEAT_THRESHOLD = 5; // Save to DB every 5 heartbeats

  constructor(private jwtService: JwtService, private prisma: PrismaService) {
    this.redis = new Redis(process.env.REDIS_URL);
    this.initializeRedisSubscriber();
  }

  private async initializeRedisSubscriber() {
    // Subscribe to location updates
    this.redis.subscribe('bus_location_updates', (err, count) => {
      if (err) {
        console.error('Redis subscription error:', err);
      }
    });

    // Handle incoming messages
    this.redis.on('message', (channel, message) => {
      if (channel === 'bus_location_updates') {
        const data = JSON.parse(message);
        // Broadcast to relevant users
        this.broadcastLocationUpdate(data);
      }
    });
  }

  async handleConnection(client: Socket) {
    try {
      // Authenticate user (optional - allow connection without auth)
      const token = client.handshake.auth.token;
      if (!token) {
        console.log('[WebSocket] Client connected without token:', client.id);
        // Allow connection but don't join any rooms
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });

      // Store user connection
      this.connectedUsers.set(client.id, payload.sub);

      // Join relevant rooms
      await this.joinUserRooms(client, payload);
      
      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
    } catch (error) {
      console.error('WebSocket authentication error:', error.message);
      // Don't disconnect on auth error - allow connection
      console.log('[WebSocket] Client connected with invalid token:', client.id);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`Client disconnected: ${client.id}, User: ${userId}`);
    }
  }

  private async joinUserRooms(client: Socket, payload: any) {
    const userId = payload.sub;
    const role = payload.role;
    const companyId = payload.companyId;
    const schoolId = payload.schoolId;

    // Join user-specific room
    client.join(`user:${userId}`);

    // Join role-specific rooms
    client.join(`role:${role}`);

    // Join company/school rooms if applicable
    if (companyId) {
      client.join(`company:${companyId}`);
    }

    if (schoolId) {
      client.join(`school:${schoolId}`);
    }

    // For drivers and parents, join bus-specific rooms
    if (role === 'DRIVER' || role === 'PARENT') {
      const relevantBuses = await this.getRelevantBuses(userId, role);
      for (const busId of relevantBuses) {
        client.join(`bus:${busId}`);
      }
    }
  }

  private async getRelevantBuses(userId: string, role: string): Promise<string[]> {
    // This would fetch buses relevant to the user based on their role
    // For drivers: buses they drive
    // For parents: buses that transport their children
    // Implementation would depend on your data model
    return [];
  }

  private broadcastLocationUpdate(data: any) {
    // Broadcast to bus-specific room
    this.server.to(`bus:${data.busId}`).emit('location_update', data);
    
    // Also emit to individual users who might be interested
    this.server.emit('new_location_update', data);
  }

  @SubscribeMessage('join_bus_room')
  async handleJoinBusRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { busId: string },
  ) {
    console.log(`[Socket] Client ${client.id} joining bus room: ${data.busId}`);
    client.join(`bus:${data.busId}`);
    const roomSize = this.server.sockets.adapter.rooms.get(`bus:${data.busId}`)?.size || 0;
    console.log(`[Socket] Bus room bus:${data.busId} now has ${roomSize} clients`);
    return { success: true };
  }

  @SubscribeMessage('leave_bus_room')
  async handleLeaveBusRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { busId: string },
  ) {
    client.leave(`bus:${data.busId}`);
    return { success: true };
  }

  @SubscribeMessage('gps_update')
  async handleGpsUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { busId: string; latitude: number; longitude: number; speed?: number; heading?: number; accuracy?: number; timestamp?: string },
  ) {
    console.log('[GPS Update] Received from client:', client.id, 'Bus:', data.busId);
    
    const locationData = {
      busId: data.busId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading,
      accuracy: data.accuracy,
      timestamp: data.timestamp || new Date().toISOString(),
    };

    // Store in Redis for real-time access
    try {
      await this.redis.setex(`bus:${data.busId}:location`, 300, JSON.stringify(locationData));
      console.log(`[GPS Update] Stored in Redis for bus ${data.busId}`);
    } catch (error) {
      console.warn('[GPS Update] Redis unavailable, continuing without cache', error);
    }

    // Save to database every N heartbeats
    const heartbeatCount = (this.gpsHeartbeatCounter.get(data.busId) || 0) + 1;
    this.gpsHeartbeatCounter.set(data.busId, heartbeatCount);
    
    if (heartbeatCount % this.HEARTBEAT_THRESHOLD === 0) {
      try {
        await this.prisma.busLocation.create({
          data: {
            busId: data.busId,
            latitude: data.latitude,
            longitude: data.longitude,
            speed: data.speed || 0,
            timestamp: new Date(locationData.timestamp),
          },
        });
        console.log(`[GPS Update] Saved to database for bus ${data.busId}`);
      } catch (error) {
        console.error('[GPS Update] Database save failed:', error);
      }
    }

    // Broadcast to bus-specific room
    const roomSize = this.server.sockets.adapter.rooms.get(`bus:${data.busId}`)?.size || 0;
    console.log(`[GPS Update] Broadcasting to ${roomSize} clients in room bus:${data.busId}`);
    
    this.server.to(`bus:${data.busId}`).emit('bus_location', locationData);
    
    // Also broadcast to all connected clients for admin dashboard
    this.server.emit('new_location_update', locationData);
    
    return { success: true };
  }

  @SubscribeMessage('join_company_room')
  async handleJoinCompanyRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { companyId: string },
  ) {
    client.join(`company:${data.companyId}`);
    console.log(`[Socket] Client ${client.id} joined company room: ${data.companyId}`);
    return { success: true };
  }

  @SubscribeMessage('subscribe_trip_tracking')
  async handleSubscribeTripTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    client.join(`trip:${data.tripId}`);
    console.log(`[Socket] Client ${client.id} subscribed to trip: ${data.tripId}`);
    return { success: true };
  }

  @SubscribeMessage('unsubscribe_trip_tracking')
  async handleUnsubscribeTripTracking(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tripId: string },
  ) {
    client.leave(`trip:${data.tripId}`);
    console.log(`[Socket] Client ${client.id} unsubscribed from trip: ${data.tripId}`);
    return { success: true };
  }

  // Method to emit location updates (called by other services)
  async emitLocationUpdate(busId: string, locationData: any) {
    // Publish to Redis for potential horizontal scaling
    await this.redis.publish('bus_location_updates', JSON.stringify({
      busId,
      ...locationData,
    }));

    // Emit directly to connected clients
    this.server.to(`bus:${busId}`).emit('location_update', locationData);
  }

  // Method to emit notification events
  async emitNewNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new_notification', notification);
  }
}
