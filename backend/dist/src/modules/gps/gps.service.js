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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GpsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ioredis_1 = require("ioredis");
let GpsService = class GpsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.HEARTBEAT_THRESHOLD = 5;
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
    }
    async processHeartbeat(busId, latitude, longitude, speed, timestamp) {
        if (!busId || !latitude || !longitude || !timestamp) {
            throw new Error('Missing required GPS data');
        }
        const locationData = {
            busId,
            latitude,
            longitude,
            speed,
            timestamp: timestamp.toISOString(),
        };
        await this.redis.setex(`bus:${busId}:location`, 300, JSON.stringify(locationData));
        const heartbeatCount = await this.redis.incr(`bus:${busId}:heartbeat_count`);
        if (heartbeatCount % this.HEARTBEAT_THRESHOLD === 0) {
            return this.prisma.busLocation.create({
                data: {
                    busId,
                    latitude,
                    longitude,
                    speed,
                    timestamp,
                },
            });
        }
        return {
            id: '',
            busId,
            latitude,
            longitude,
            speed,
            timestamp,
            createdAt: new Date(),
        };
    }
    async getCurrentLocation(busId) {
        const location = await this.redis.get(`bus:${busId}:location`);
        return location ? JSON.parse(location) : null;
    }
    async getRecentLocations(busId, limit = 10) {
        return this.prisma.busLocation.findMany({
            where: { busId },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });
    }
};
exports.GpsService = GpsService;
exports.GpsService = GpsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GpsService);
//# sourceMappingURL=gps.service.js.map