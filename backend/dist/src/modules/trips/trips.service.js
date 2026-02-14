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
exports.TripsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const ExtendedTripStatus = client_1.TripStatus;
let TripsService = class TripsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.trip.findUnique({
            where: { id },
            include: {
                histories: true,
            },
        });
    }
    async create(data) {
        if (!data.driverId || !data.busId || !data.routeId) {
            throw new Error('Trip must have driverId, busId, and routeId assigned');
        }
        const driver = await this.prisma.driver.findUnique({
            where: { id: data.driverId },
        });
        if (!driver) {
            throw new Error(`Driver with ID ${data.driverId} not found`);
        }
        const bus = await this.prisma.bus.findUnique({
            where: { id: data.busId },
        });
        if (!bus) {
            throw new Error(`Bus with ID ${data.busId} not found`);
        }
        const route = await this.prisma.route.findUnique({
            where: { id: data.routeId },
        });
        if (!route) {
            throw new Error(`Route with ID ${data.routeId} not found`);
        }
        console.log(`[TripsService] Creating trip: Driver=${driver.id}, Bus=${bus.id}, Route=${route.id}`);
        return this.prisma.trip.create({
            data,
            include: {
                histories: true,
            },
        });
    }
    async update(id, data) {
        if (data.driverId) {
            const driver = await this.prisma.driver.findUnique({
                where: { id: data.driverId },
            });
            if (!driver) {
                throw new Error(`Driver with ID ${data.driverId} not found`);
            }
            console.log(`[TripsService] Updating trip ${id}: Reassigning to driver ${driver.id}`);
        }
        return this.prisma.trip.update({
            where: { id },
            data,
            include: {
                histories: true,
            },
        });
    }
    async findAll() {
        return this.prisma.trip.findMany({
            include: {
                histories: true,
            },
        });
    }
    async findActiveByChildId(childId) {
        return this.prisma.trip.findFirst({
            where: {
                status: { in: ['SCHEDULED', 'IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'] },
                attendances: {
                    some: {
                        childId: childId,
                    },
                },
            },
            include: {
                bus: {
                    include: {
                        driver: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                route: true,
                histories: true,
                attendances: {
                    where: { childId: childId },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findActiveBySchoolId(schoolId) {
        return this.prisma.trip.findMany({
            where: {
                status: { in: ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS', 'SCHEDULED'] },
                route: {
                    schoolId,
                },
            },
            include: {
                bus: {
                    include: {
                        driver: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                route: true,
                attendances: {
                    include: {
                        child: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async remove(id) {
        return this.prisma.trip.delete({
            where: { id },
        });
    }
    async transitionTripStatus(tripId, newStatus, userId, metadata) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                route: true,
                bus: true,
                driver: { include: { user: true } },
                attendances: { include: { child: { include: { parent: true } } } },
            },
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        if (!this.isValidTransition(trip.status, newStatus)) {
            throw new Error(`Invalid status transition from ${trip.status} to ${newStatus}`);
        }
        const updateData = { status: newStatus };
        if (newStatus === client_1.TripStatus.IN_PROGRESS) {
            updateData.startTime = new Date();
        }
        else if (newStatus === client_1.TripStatus.COMPLETED) {
            updateData.endTime = new Date();
        }
        else if (newStatus === client_1.TripStatus.DELAYED) {
            updateData.delayMinutes = metadata?.delayMinutes || 0;
            updateData.delayReason = metadata?.delayReason || 'Unknown';
            if (!trip.originalStartTime) {
                updateData.originalStartTime = trip.startTime || new Date();
            }
        }
        else if (newStatus === client_1.TripStatus.EMERGENCY) {
            updateData.emergencyType = metadata?.emergencyType || 'OTHER';
            updateData.emergencyNote = metadata?.emergencyNote || '';
        }
        const updatedTrip = await this.prisma.trip.update({
            where: { id: tripId },
            data: updateData,
            include: {
                histories: true,
            },
        });
        await this.prisma.tripHistory.create({
            data: {
                tripId: tripId,
                status: newStatus,
            },
        });
        await this.sendStatusNotification(trip, newStatus, metadata);
        return updatedTrip;
    }
    async sendStatusNotification(trip, newStatus, metadata) {
        const parentIds = [...new Set(trip.attendances.map(a => a.child.parentId).filter(Boolean))];
        for (const parentId of parentIds) {
            const parent = trip.attendances.find(a => a.child.parentId === parentId)?.child.parent;
            if (!parent)
                continue;
            let title = '';
            let message = '';
            let type = 'TRIP_UPDATE';
            switch (newStatus) {
                case client_1.TripStatus.DELAYED:
                    title = 'Trip Delayed';
                    const delayReason = metadata?.delayReason || 'Traffic conditions';
                    const delayMinutes = metadata?.delayMinutes || 0;
                    message = `The bus trip for ${trip.route.name} is delayed by approximately ${delayMinutes} minutes. Reason: ${delayReason}. We apologize for the inconvenience.`;
                    type = 'DELAY';
                    break;
                case client_1.TripStatus.EMERGENCY:
                    title = 'Emergency Alert';
                    const emergencyType = metadata?.emergencyType || 'Other';
                    message = `IMPORTANT: There is an emergency situation (${emergencyType}) on the bus trip for ${trip.route.name}. ${metadata?.emergencyNote || 'Please await further updates.'}`;
                    type = 'EMERGENCY';
                    break;
                case client_1.TripStatus.IN_PROGRESS:
                    title = 'Trip Started';
                    message = `The bus for ${trip.route.name} has started its journey. Track the bus in real-time.`;
                    type = 'TRIP_UPDATE';
                    break;
                case client_1.TripStatus.ARRIVED_SCHOOL:
                    title = 'Arrived at School';
                    message = `The bus has arrived at the school. ${trip.route.name} trip completed.`;
                    type = 'DROPOFF';
                    break;
                case client_1.TripStatus.COMPLETED:
                    title = 'Trip Completed';
                    message = `The trip ${trip.route.name} has been completed successfully. Your child is now home.`;
                    type = 'DROPOFF';
                    break;
                case client_1.TripStatus.CANCELLED:
                    title = 'Trip Cancelled';
                    message = `The trip ${trip.route.name} has been cancelled. Please make alternative arrangements for your child.`;
                    type = 'TRIP_UPDATE';
                    break;
                default:
                    return;
            }
            await this.prisma.notification.create({
                data: {
                    userId: parent.id,
                    title,
                    message,
                    type,
                    relatedEntityType: 'TRIP',
                    relatedEntityId: trip.id,
                },
            });
        }
    }
    async assignBackupDriver(tripId, backupDriverId) {
        const backupDriver = await this.prisma.driver.findUnique({
            where: { id: backupDriverId },
            include: { user: true },
        });
        if (!backupDriver) {
            throw new Error(`Backup driver with ID ${backupDriverId} not found`);
        }
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                driver: { include: { user: true } },
                route: true,
            },
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        const updatedTrip = await this.prisma.trip.update({
            where: { id: tripId },
            data: {
                driverId: backupDriverId,
                backupDriverId: trip.driverId,
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: trip.driver.userId,
                title: 'Trip Reassigned',
                message: `Your trip on ${trip.route.name || 'route'} has been reassigned to another driver due to absence.`,
                type: client_1.NotificationType.TRIP_UPDATE,
                relatedEntityType: 'TRIP',
                relatedEntityId: tripId,
            },
        });
        await this.prisma.notification.create({
            data: {
                userId: backupDriver.userId,
                title: 'New Trip Assigned',
                message: `You have been assigned as backup driver for the trip on ${trip.route.name || 'route'}. Please check the trip details.`,
                type: 'TRIP_UPDATE',
                relatedEntityType: 'TRIP',
                relatedEntityId: tripId,
            },
        });
        return updatedTrip;
    }
    isValidTransition(from, to) {
        const validTransitions = {
            [client_1.TripStatus.SCHEDULED]: [
                client_1.TripStatus.IN_PROGRESS,
                client_1.TripStatus.DELAYED,
                client_1.TripStatus.EMERGENCY,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.DELAYED]: [
                client_1.TripStatus.IN_PROGRESS,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.EMERGENCY]: [
                client_1.TripStatus.IN_PROGRESS,
                client_1.TripStatus.COMPLETED,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.IN_PROGRESS]: [
                client_1.TripStatus.ARRIVED_SCHOOL,
                client_1.TripStatus.COMPLETED,
                client_1.TripStatus.DELAYED,
                client_1.TripStatus.EMERGENCY,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.ARRIVED_SCHOOL]: [
                client_1.TripStatus.RETURN_IN_PROGRESS,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.RETURN_IN_PROGRESS]: [
                client_1.TripStatus.COMPLETED,
                client_1.TripStatus.DELAYED,
                client_1.TripStatus.EMERGENCY,
                client_1.TripStatus.CANCELLED
            ],
            [client_1.TripStatus.COMPLETED]: [],
            [client_1.TripStatus.CANCELLED]: [],
        };
        return validTransitions[from]?.includes(to) || false;
    }
};
exports.TripsService = TripsService;
TripsService.DELAY_REASONS = [
    'TRAFFIC',
    'ROAD_CONDITION',
    'WEATHER',
    'VEHICLE_ISSUE',
    'EARLY_PICKUP',
    'OTHER'
];
TripsService.EMERGENCY_TYPES = [
    'MEDICAL',
    'BREAKDOWN',
    'SAFETY',
    'WEATHER',
    'OTHER'
];
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map