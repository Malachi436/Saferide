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
    async findActiveByCompanyId(companyId) {
        return this.prisma.trip.findMany({
            where: {
                status: { in: ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS', 'SCHEDULED'] },
                driver: {
                    user: {
                        companyId: companyId,
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
    async transitionTripStatus(tripId, newStatus, userId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        if (!this.isValidTransition(trip.status, newStatus)) {
            throw new Error(`Invalid status transition from ${trip.status} to ${newStatus}`);
        }
        const updatedTrip = await this.prisma.trip.update({
            where: { id: tripId },
            data: {
                status: newStatus,
                ...(newStatus === client_1.TripStatus.IN_PROGRESS && { startTime: new Date() }),
                ...(newStatus === client_1.TripStatus.COMPLETED && { endTime: new Date() }),
            },
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
        return updatedTrip;
    }
    isValidTransition(from, to) {
        const validTransitions = {
            [client_1.TripStatus.SCHEDULED]: [client_1.TripStatus.IN_PROGRESS],
            [client_1.TripStatus.IN_PROGRESS]: [client_1.TripStatus.ARRIVED_SCHOOL, client_1.TripStatus.COMPLETED],
            [client_1.TripStatus.ARRIVED_SCHOOL]: [client_1.TripStatus.RETURN_IN_PROGRESS],
            [client_1.TripStatus.RETURN_IN_PROGRESS]: [client_1.TripStatus.COMPLETED],
            [client_1.TripStatus.COMPLETED]: [],
        };
        return validTransitions[from].includes(to);
    }
};
exports.TripsService = TripsService;
exports.TripsService = TripsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TripsService);
//# sourceMappingURL=trips.service.js.map