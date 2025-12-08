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
        return this.prisma.trip.create({
            data,
            include: {
                histories: true,
            },
        });
    }
    async update(id, data) {
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
                status: { in: ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'] },
                attendances: {
                    some: {
                        childId: childId,
                    },
                },
            },
            include: {
                histories: true,
                attendances: {
                    where: { childId: childId },
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
            [client_1.TripStatus.IN_PROGRESS]: [client_1.TripStatus.ARRIVED_SCHOOL],
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