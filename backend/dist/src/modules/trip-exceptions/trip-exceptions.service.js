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
exports.TripExceptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
const notifications_service_1 = require("../notifications/notifications.service");
let TripExceptionsService = class TripExceptionsService {
    constructor(prisma, realtimeGateway, notificationsService) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
        this.notificationsService = notificationsService;
    }
    async skipTrip(childId, tripId, reason) {
        const exception = await this.prisma.tripException.upsert({
            where: { childId_tripId: { childId, tripId } },
            update: {
                reason,
                status: 'ACTIVE',
                requestedAt: new Date(),
            },
            create: {
                childId,
                tripId,
                date: new Date(),
                type: 'SKIP_TRIP',
                reason,
                status: 'ACTIVE',
            },
            include: {
                child: true,
            },
        });
        if (this.realtimeGateway) {
            await this.realtimeGateway.server.to(`trip:${tripId}`).emit('trip_skip_requested', {
                childId: exception.child.id,
                childName: `${exception.child.firstName} ${exception.child.lastName}`,
                reason,
                timestamp: new Date(),
            });
        }
        return exception;
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
                child: true,
            },
        });
    }
    async getChildExceptions(childId) {
        return this.prisma.tripException.findMany({
            where: { childId },
            include: {
                trip: true,
            },
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
    async unskipTrip(childId, tripId, parentId, reason) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                driver: {
                    include: {
                        user: true,
                    },
                },
                bus: true,
            },
        });
        if (!trip) {
            throw new common_1.NotFoundException('Trip not found');
        }
        if (trip.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot unskip a completed trip');
        }
        const exception = await this.prisma.tripException.findUnique({
            where: { childId_tripId: { childId, tripId } },
            include: {
                child: {
                    include: {
                        parent: true,
                    },
                },
            },
        });
        if (!exception || exception.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('No active skip found for this child and trip');
        }
        const updatedExcep = await this.prisma.tripException.update({
            where: { childId_tripId: { childId, tripId } },
            data: {
                status: 'CANCELLED',
                reason: `UNSKIPPED: ${reason || 'Emergency pickup requested'}`,
            },
        });
        const existingAttendance = await this.prisma.childAttendance.findUnique({
            where: { childId_tripId: { childId, tripId } },
        });
        if (!existingAttendance) {
            await this.prisma.childAttendance.create({
                data: {
                    childId,
                    tripId,
                    status: 'PENDING',
                    timestamp: new Date(),
                    recordedBy: parentId,
                },
            });
        }
        else if (existingAttendance.status === 'MISSED') {
            await this.prisma.childAttendance.update({
                where: { id: existingAttendance.id },
                data: {
                    status: 'PENDING',
                    timestamp: new Date(),
                },
            });
        }
        if (this.notificationsService && trip.driver) {
            const notification = await this.notificationsService.create({
                userId: trip.driver.userId,
                title: '🚨 Emergency Pickup Request',
                message: `${exception.child.firstName} ${exception.child.lastName} needs to be picked up urgently. Parent has un-skipped this trip. ${reason || ''}`,
                type: 'UNSKIP_REQUEST',
                requiresAck: true,
                relatedEntityType: 'TRIP_EXCEPTION',
                relatedEntityId: exception.id,
                metadata: {
                    childId: exception.child.id,
                    childName: `${exception.child.firstName} ${exception.child.lastName}`,
                    parentName: `${exception.child.parent.firstName} ${exception.child.parent.lastName}`,
                    parentPhone: exception.child.parent.phone,
                    tripId,
                    busId: trip.busId,
                    plateNumber: trip.bus.plateNumber,
                    pickupLatitude: exception.child.pickupLatitude || exception.child.homeLatitude,
                    pickupLongitude: exception.child.pickupLongitude || exception.child.homeLongitude,
                    pickupAddress: exception.child.homeAddress,
                    urgent: true,
                },
            });
            if (this.realtimeGateway) {
                await this.realtimeGateway.server.to(`trip:${tripId}`).emit('unskip_request', {
                    notificationId: notification.id,
                    childId: exception.child.id,
                    childName: `${exception.child.firstName} ${exception.child.lastName}`,
                    pickupLocation: {
                        latitude: exception.child.pickupLatitude || exception.child.homeLatitude,
                        longitude: exception.child.pickupLongitude || exception.child.homeLongitude,
                        address: exception.child.homeAddress,
                    },
                    reason,
                    timestamp: new Date(),
                    urgent: true,
                });
            }
        }
        return {
            success: true,
            message: 'Child successfully unskipped. Driver has been notified.',
            exception: updatedExcep,
            child: exception.child,
        };
    }
};
exports.TripExceptionsService = TripExceptionsService;
exports.TripExceptionsService = TripExceptionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(2, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway,
        notifications_service_1.NotificationsService])
], TripExceptionsService);
//# sourceMappingURL=trip-exceptions.service.js.map