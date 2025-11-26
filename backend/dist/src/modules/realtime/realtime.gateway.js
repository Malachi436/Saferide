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
let RealtimeGateway = class RealtimeGateway {
    constructor(jwtService) {
        this.jwtService = jwtService;
        this.connectedUsers = new Map();
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
        this.initializeRedisSubscriber();
    }
    async initializeRedisSubscriber() {
        this.redis.subscribe('bus_location_updates', (err, count) => {
            if (err) {
                console.error('Redis subscription error:', err);
            }
        });
        this.redis.on('message', (channel, message) => {
            if (channel === 'bus_location_updates') {
                const data = JSON.parse(message);
                this.broadcastLocationUpdate(data);
            }
        });
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token;
            if (!token) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });
            this.connectedUsers.set(client.id, payload.sub);
            await this.joinUserRooms(client, payload);
            console.log(`Client connected: ${client.id}, User: ${payload.sub}`);
        }
        catch (error) {
            console.error('WebSocket authentication error:', error);
            client.disconnect();
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
        client.join(`bus:${data.busId}`);
        return { success: true };
    }
    async handleLeaveBusRoom(client, data) {
        client.leave(`bus:${data.busId}`);
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
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map