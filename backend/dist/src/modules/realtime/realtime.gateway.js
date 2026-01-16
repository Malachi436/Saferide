"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const ioredis_1 = require("ioredis");
const prisma_service_1 = require("../../prisma/prisma.service");
let RealtimeGateway = class RealtimeGateway {
    constructor(jwtService, prisma) {
        this.jwtService = jwtService;
        this.prisma = prisma;
        this.connectedUsers = new Map();
        this.gpsHeartbeatCounter = new Map();
        this.HEARTBEAT_THRESHOLD = 5;
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
        this.redisSub = new ioredis_1.Redis(process.env.REDIS_URL);
        this.initializeRedisSubscriber();
    }
    async initializeRedisSubscriber() {
        this.redisSub.subscribe('bus_location_updates', (err, count) => {
            if (err) {
                console.error('Redis subscription error:', err);
            }
        });
        this.redisSub.on('message', (channel, message) => {
            if (channel === 'bus_location_updates') {
                const data = JSON.parse(message);
                this.broadcastLocationUpdate(data);
            }
        });
    }
    async handleConnection(client) {
        console.log(`[WebSocket] Client connected: ${client.id}`);
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                console.log('[WebSocket] Client connected without token, allowing anonymous access');
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });
            this.connectedUsers.set(client.id, payload.sub);
            await this.joinUserRooms(client, payload);
            console.log(`[WebSocket] Authenticated client: ${client.id}, User: ${payload.sub}`);
        }
        catch (error) {
            console.log(`[WebSocket] Client ${client.id} has expired/invalid token, allowing anonymous access`);
        }
    }
    handleDisconnect(client) {
        const userId = this.connectedUsers.get(client.id);
        if (userId) {
            this.connectedUsers.delete(client.id);
            console.log(`Client disconnected: ${client.id}, User: ${userId}`);
        }
    }
    async joinUserRooms(client, payload) {
        const userId = payload.sub;
        const role = payload.role;
        const companyId = payload.companyId;
        const schoolId = payload.schoolId;
        client.join(`user:${userId}`);
        client.join(`role:${role}`);
        if (companyId) {
            client.join(`company:${companyId}`);
        }
        if (schoolId) {
            client.join(`school:${schoolId}`);
        }
        if (role === 'DRIVER' || role === 'PARENT') {
            const relevantBuses = await this.getRelevantBuses(userId, role);
            for (const busId of relevantBuses) {
                client.join(`bus:${busId}`);
            }
        }
    }
    async getRelevantBuses(userId, role) {
        return [];
    }
    broadcastLocationUpdate(data) {
        this.server.to(`bus:${data.busId}`).emit('location_update', data);
        this.server.emit('new_location_update', data);
    }
    async handleJoinBusRoom(client, data) {
        console.log(`[Socket] Client ${client.id} joining bus room: ${data.busId}`);
        client.join(`bus:${data.busId}`);
        const roomSize = this.server.sockets.adapter.rooms.get(`bus:${data.busId}`)?.size || 0;
        console.log(`[Socket] Bus room bus:${data.busId} now has ${roomSize} clients`);
        return { success: true };
    }
    async handleLeaveBusRoom(client, data) {
        client.leave(`bus:${data.busId}`);
        return { success: true };
    }
    async handleGpsUpdate(client, data) {
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
        try {
            await this.redis.setex(`bus:${data.busId}:location`, 300, JSON.stringify(locationData));
            console.log(`[GPS Update] Stored in Redis for bus ${data.busId}`);
        }
        catch (error) {
            console.warn('[GPS Update] Redis unavailable, continuing without cache', error);
        }
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
            }
            catch (error) {
                console.error('[GPS Update] Database save failed:', error);
            }
        }
        const roomSize = this.server.sockets.adapter.rooms.get(`bus:${data.busId}`)?.size || 0;
        console.log(`[GPS Update] Broadcasting to ${roomSize} clients in room bus:${data.busId}`);
        this.server.to(`bus:${data.busId}`).emit('bus_location', locationData);
        const totalClients = this.server.sockets.sockets.size;
        console.log(`[GPS Update] Broadcasting new_location_update to ${totalClients} total connected clients`);
        this.server.emit('new_location_update', locationData);
        console.log(`[GPS Update] Broadcast complete`);
        return { success: true };
    }
    async handleJoinCompanyRoom(client, data) {
        client.join(`company:${data.companyId}`);
        console.log(`[Socket] Client ${client.id} joined company room: ${data.companyId}`);
        return { success: true };
    }
    async handleJoinSchoolRoom(client, data) {
        client.join(`school:${data.schoolId}`);
        console.log(`[Socket] Client ${client.id} joined school room: ${data.schoolId}`);
        return { success: true };
    }
    async handleSubscribeTripTracking(client, data) {
        client.join(`trip:${data.tripId}`);
        console.log(`[Socket] Client ${client.id} subscribed to trip: ${data.tripId}`);
        return { success: true };
    }
    async handleUnsubscribeTripTracking(client, data) {
        client.leave(`trip:${data.tripId}`);
        console.log(`[Socket] Client ${client.id} unsubscribed from trip: ${data.tripId}`);
        return { success: true };
    }
    async emitLocationUpdate(busId, locationData) {
        await this.redis.publish('bus_location_updates', JSON.stringify({
            busId,
            ...locationData,
        }));
        this.server.to(`bus:${busId}`).emit('location_update', locationData);
    }
    async emitNewNotification(userId, notification) {
        this.server.to(`user:${userId}`).emit('new_notification', notification);
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_bus_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinBusRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_bus_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleLeaveBusRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('gps_update'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleGpsUpdate", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_company_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinCompanyRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_school_room'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleJoinSchoolRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_trip_tracking'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleSubscribeTripTracking", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe_trip_tracking'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "handleUnsubscribeTripTracking", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 60000,
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService, prisma_service_1.PrismaService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map