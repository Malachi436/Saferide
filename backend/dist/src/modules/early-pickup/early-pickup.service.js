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
exports.EarlyPickupRequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let EarlyPickupRequestsService = class EarlyPickupRequestsService {
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    async requestEarlyPickup(childId, tripId, parentId, reason, timeOfDay) {
        const existing = await this.prisma.earlyPickupRequest.findUnique({
            where: { childId_tripId: { childId, tripId } },
        });
        if (existing && existing.status === client_1.RequestStatus.PENDING) {
            throw new Error('Parent pickup request already exists for this trip');
        }
        const request = await this.prisma.earlyPickupRequest.create({
            data: {
                childId,
                tripId,
                requestedBy: parentId,
                reason,
                timeOfDay,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                child: true,
                trip: true,
                requestedByUser: {
                    select: { id: true, firstName: true, lastName: true, phone: true },
                },
            },
        });
        if (this.realtimeGateway) {
            await this.realtimeGateway.server.to(`trip:${tripId}`).emit('parent_pickup_requested', {
                requestId: request.id,
                childId: request.child.id,
                childName: `${request.child.firstName} ${request.child.lastName}`,
                parentName: request.requestedByUser.firstName,
                timeOfDay: timeOfDay || 'ALL_DAY',
                reason,
                timestamp: new Date(),
            });
        }
        return request;
    }
    async approveEarlyPickup(requestId, approvedBy) {
        const request = await this.prisma.earlyPickupRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.APPROVED,
                approvedBy,
                approvedAt: new Date(),
            },
            include: {
                child: true,
                trip: true,
                requestedByUser: true,
            },
        });
        if (this.realtimeGateway) {
            await this.realtimeGateway.server
                .to(`user:${request.requestedBy}`)
                .emit('early_pickup_approved', {
                childName: `${request.child.firstName} ${request.child.lastName}`,
                timestamp: new Date(),
            });
        }
        return request;
    }
    async rejectEarlyPickup(requestId, rejectionReason) {
        const request = await this.prisma.earlyPickupRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.REJECTED,
                rejectionReason,
            },
            include: {
                child: true,
                requestedByUser: true,
            },
        });
        if (this.realtimeGateway) {
            await this.realtimeGateway.server
                .to(`user:${request.requestedBy}`)
                .emit('early_pickup_rejected', {
                childName: `${request.child.firstName} ${request.child.lastName}`,
                reason: rejectionReason,
                timestamp: new Date(),
            });
        }
        return request;
    }
    async cancelRequest(requestId) {
        const request = await this.prisma.earlyPickupRequest.findUnique({
            where: { id: requestId },
        });
        if (!request || request.status === client_1.RequestStatus.APPROVED) {
            throw new Error('Cannot cancel this request');
        }
        return this.prisma.earlyPickupRequest.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.CANCELLED,
            },
        });
    }
    async getPendingRequestsForTrip(tripId) {
        return this.prisma.earlyPickupRequest.findMany({
            where: {
                tripId,
                status: client_1.RequestStatus.PENDING,
            },
            include: {
                child: true,
                requestedByUser: {
                    select: { id: true, firstName: true, lastName: true, phone: true },
                },
            },
        });
    }
    async getParentRequests(parentId) {
        return this.prisma.earlyPickupRequest.findMany({
            where: { requestedBy: parentId },
            include: {
                child: true,
                trip: true,
            },
            orderBy: { requestedTime: 'desc' },
        });
    }
    async getApprovedRequestsForTrip(tripId) {
        return this.prisma.earlyPickupRequest.findMany({
            where: {
                tripId,
                status: client_1.RequestStatus.APPROVED,
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
};
exports.EarlyPickupRequestsService = EarlyPickupRequestsService;
exports.EarlyPickupRequestsService = EarlyPickupRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], EarlyPickupRequestsService);
//# sourceMappingURL=early-pickup.service.js.map