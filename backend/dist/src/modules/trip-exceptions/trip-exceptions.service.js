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
exports.TripExceptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let TripExceptionsService = class TripExceptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async skipTrip(childId, tripId, reason) {
        const existing = await this.prisma.tripException.findUnique({
            where: { childId_tripId: { childId, tripId } },
        });
        if (existing) {
            return this.prisma.tripException.update({
                where: { id: existing.id },
                data: {
                    reason,
                    status: 'ACTIVE',
                },
            });
        }
        return this.prisma.tripException.create({
            data: {
                childId,
                tripId,
                reason,
                type: 'SKIP_TRIP',
                status: 'ACTIVE',
                date: new Date(),
            },
            include: {
                child: true,
                trip: true,
            },
        });
    }
    async cancelSkipTrip(childId, tripId) {
        return this.prisma.tripException.update({
            where: { childId_tripId: { childId, tripId } },
            data: {
                status: 'CANCELLED',
            },
        });
    }
    async getTripExceptions(tripId) {
        return this.prisma.tripException.findMany({
            where: {
                tripId,
                status: 'ACTIVE',
            },
            include: {
                child: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
    }
    async getChildExceptions(childId) {
        return this.prisma.tripException.findMany({
            where: { childId },
            include: { trip: true },
            orderBy: { date: 'desc' },
        });
    }
    async getExceptionsByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.prisma.tripException.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'ACTIVE',
            },
            include: {
                child: true,
                trip: true,
            },
        });
    }
};
exports.TripExceptionsService = TripExceptionsService;
exports.TripExceptionsService = TripExceptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripExceptionsService);
//# sourceMappingURL=trip-exceptions.service.js.map