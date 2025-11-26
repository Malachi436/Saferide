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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const ioredis_1 = require("ioredis");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.redis = new ioredis_1.Redis(process.env.REDIS_URL);
    }
    async getRoutePerformance(routeId) {
        const cacheKey = `analytics:route:${routeId}`;
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const trips = await this.prisma.trip.findMany({
            where: { routeId },
            include: {
                histories: true,
            },
        });
        const metrics = {
            totalTrips: trips.length,
            onTimeTrips: trips.filter(trip => this.isTripOnTime(trip)).length,
            avgDuration: this.calculateAverageDuration(trips),
            completionRate: trips.length > 0 ? trips.filter(t => t.status === 'COMPLETED').length / trips.length : 0,
        };
        await this.redis.setex(cacheKey, 3600, JSON.stringify(metrics));
        return metrics;
    }
    async getMissedPickups() {
        const cacheKey = 'analytics:missed_pickups';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const missedPickups = await this.prisma.childAttendance.count({
            where: {
                status: 'MISSED',
            },
        });
        await this.redis.setex(cacheKey, 1800, JSON.stringify({ count: missedPickups }));
        return { count: missedPickups };
    }
    async getTripSuccessRate() {
        const cacheKey = 'analytics:trip_success_rate';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const totalTrips = await this.prisma.trip.count();
        const completedTrips = await this.prisma.trip.count({
            where: {
                status: 'COMPLETED',
            },
        });
        const successRate = totalTrips > 0 ? completedTrips / totalTrips : 0;
        const metrics = {
            totalTrips,
            completedTrips,
            successRate,
        };
        await this.redis.setex(cacheKey, 3600, JSON.stringify(metrics));
        return metrics;
    }
    async getPaymentCompletionRate() {
        const cacheKey = 'analytics:payment_completion_rate';
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }
        const totalPayments = await this.prisma.paymentIntent.count();
        const successfulPayments = await this.prisma.paymentIntent.count({
            where: {
                status: 'succeeded',
            },
        });
        const completionRate = totalPayments > 0 ? successfulPayments / totalPayments : 0;
        const metrics = {
            totalPayments,
            successfulPayments,
            completionRate,
        };
        await this.redis.setex(cacheKey, 3600, JSON.stringify(metrics));
        return metrics;
    }
    isTripOnTime(trip) {
        return trip.status === 'COMPLETED' && trip.endTime && trip.startTime &&
            (new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime()) < 3600000;
    }
    calculateAverageDuration(trips) {
        if (trips.length === 0)
            return 0;
        const durations = trips
            .filter(trip => trip.startTime && trip.endTime)
            .map(trip => new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime());
        if (durations.length === 0)
            return 0;
        const sum = durations.reduce((acc, duration) => acc + duration, 0);
        return sum / durations.length;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map