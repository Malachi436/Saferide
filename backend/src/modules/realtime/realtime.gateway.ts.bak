import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, ConnectedSocket, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Redis } from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly redis: Redis;
  private readonly connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(private jwtService: JwtService) {
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
      // Authenticate user
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
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
      console.error('WebSocket authentication error:', error);
      client.disconnect();
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
    client.join(`bus:${data.busId}`);
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