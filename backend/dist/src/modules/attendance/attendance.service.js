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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
const realtime_gateway_1 = require("../realtime/realtime.gateway");
let AttendanceService = class AttendanceService {
    constructor(prisma, realtimeGateway) {
        this.prisma = prisma;
        this.realtimeGateway = realtimeGateway;
    }
    getStatusText(status) {
        switch (status) {
            case 'PICKED_UP': return 'picked up';
            case 'DROPPED': return 'dropped off at school';
            case 'MISSED': return 'missed';
            case 'PENDING': return 'waiting for pickup';
        }
    }
    async recordAttendance(childId, tripId, status, recordedBy) {
        return this.prisma.childAttendance.create({
            data: {
                childId,
                tripId,
                status,
                recordedBy,
            },
        });
    }
    async updateAttendance(id, status, recordedBy) {
        const currentAttendance = await this.prisma.childAttendance.findUnique({
            where: { id },
            include: { child: true },
        });
        const previousStatus = currentAttendance?.status;
        const attendance = await this.prisma.childAttendance.update({
            where: { id },
            data: {
                status,
                recordedBy,
            },
            include: {
                child: true,
                trip: true,
            },
        });
        try {
            if (attendance.child) {
                const parentUserId = attendance.child.parentId;
                const childName = `${attendance.child.firstName} ${attendance.child.lastName}`;
                const statusText = this.getStatusText(status);
                const notificationType = status === 'PICKED_UP' ? client_1.NotificationType.PICKUP : client_1.NotificationType.DROPOFF;
                const notificationTitle = status === 'PICKED_UP' ? 'Child Picked Up' : 'Child Dropped Off';
                const notificationMessage = `${childName} has been ${statusText}.`;
                await this.prisma.notification.create({
                    data: {
                        userId: parentUserId,
                        title: notificationTitle,
                        message: notificationMessage,
                        type: notificationType,
                    },
                });
                console.log(`[Attendance] Created notification for parent ${parentUserId}: ${notificationMessage}`);
                if (this.realtimeGateway?.server) {
                    const eventData = {
                        childId: attendance.childId,
                        childName,
                        status: attendance.status,
                        previousStatus,
                        tripId: attendance.tripId,
                        timestamp: new Date().toISOString(),
                    };
                    console.log(`[Attendance] Emitting status update to parent ${parentUserId}:`, eventData);
                    this.realtimeGateway.server.to(`user:${parentUserId}`).emit('attendance_updated', eventData);
                    this.realtimeGateway.server.to(`trip:${attendance.tripId}`).emit('attendance_updated', eventData);
                    this.realtimeGateway.server.emit('attendance_updated', eventData);
                }
            }
        }
        catch (error) {
            console.error('[Attendance] Error creating notification or emitting event:', error);
        }
        return attendance;
    }
    async getAttendanceByChild(childId) {
        return this.prisma.childAttendance.findMany({
            where: { childId },
            orderBy: { timestamp: 'desc' },
        });
    }
    async getAttendanceByTrip(tripId) {
        return this.prisma.childAttendance.findMany({
            where: { tripId },
            include: {
                child: true,
            },
        });
    }
    async getAttendanceById(id) {
        return this.prisma.childAttendance.findUnique({
            where: { id },
            include: {
                child: true,
                trip: true,
            },
        });
    }
    async markChildAsMissed(childId, tripId, recordedBy) {
        return this.recordAttendance(childId, tripId, client_1.AttendanceStatus.MISSED, recordedBy);
    }
    async verifyTripAttendance(tripId) {
        const trip = await this.prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                route: {
                    include: {
                        children: {
                            where: { isClaimed: true },
                        },
                    },
                },
                attendances: true,
            },
        });
        if (!trip) {
            throw new Error('Trip not found');
        }
        const expectedChildren = trip.route.children;
        const attendedChildren = trip.attendances;
        const missing = expectedChildren
            .filter(child => {
            const attendance = attendedChildren.find(a => a.childId === child.id);
            return !attendance || attendance.status === client_1.AttendanceStatus.PENDING;
        })
            .map(child => ({
            childId: child.id,
            childName: `${child.firstName} ${child.lastName}`,
            expectedStatus: trip.status === 'RETURN_IN_PROGRESS' ? 'DROPPED' : 'PICKED_UP',
        }));
        return {
            totalExpected: expectedChildren.length,
            totalAccounted: expectedChildren.length - missing.length,
            missing,
            allAccounted: missing.length === 0,
        };
    }
    async checkForChildrenLeftOnBus(tripId) {
        const verification = await this.verifyTripAttendance(tripId);
        if (!verification.allAccounted) {
            const childrenOnBus = await Promise.all(verification.missing.map(async (m) => {
                const child = await this.prisma.child.findUnique({
                    where: { id: m.childId },
                    include: { parent: true },
                });
                return {
                    childId: m.childId,
                    childName: m.childName,
                    parentContact: child?.parent?.phone || child?.parentPhone || null,
                };
            }));
            const trip = await this.prisma.trip.findUnique({
                where: { id: tripId },
                include: {
                    route: true,
                    driver: { include: { user: true } },
                    bus: true,
                },
            });
            if (trip) {
                const schoolAdmins = await this.prisma.user.findMany({
                    where: {
                        schoolId: trip.route.schoolId,
                        role: 'SCHOOL_ADMIN',
                    },
                });
                for (const admin of schoolAdmins) {
                    await this.prisma.notification.create({
                        data: {
                            userId: admin.id,
                            title: 'CRITICAL: Children Left on Bus',
                            message: `${verification.missing.length} child(ren) may still be on bus ${trip.bus.plateNumber} on trip ${trip.route.name}. Please verify immediately.`,
                            type: client_1.NotificationType.ALERT,
                            requiresAck: true,
                            relatedEntityType: 'TRIP',
                            relatedEntityId: tripId,
                        },
                    });
                }
                await this.prisma.notification.create({
                    data: {
                        userId: trip.driver.userId,
                        title: 'CRITICAL: Verify Bus is Empty',
                        message: `Please perform a final sweep of the bus. ${verification.missing.length} child(ren) are not accounted for on trip ${trip.route.name}.`,
                        type: client_1.NotificationType.ALERT,
                        requiresAck: true,
                        relatedEntityType: 'TRIP',
                        relatedEntityId: tripId,
                    },
                });
            }
            return {
                childrenLeftOnBus: childrenOnBus,
                alertTriggered: true,
            };
        }
        return {
            childrenLeftOnBus: [],
            alertTriggered: false,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map