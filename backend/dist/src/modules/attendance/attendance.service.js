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
        const existing = await this.prisma.childAttendance.findUnique({
            where: { id },
            include: { child: true, trip: true },
        });
        if (!existing) {
            throw new Error(`Attendance record ${id} not found`);
        }
        const updated = await this.prisma.childAttendance.update({
            where: { id },
            data: {
                status,
                recordedBy,
            },
        });
        if (existing.child?.parentId) {
            this.realtimeGateway.emitAttendanceUpdate(existing.child.parentId, {
                childId: existing.childId,
                tripId: existing.tripId,
                status,
                timestamp: new Date(),
            });
        }
        return updated;
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
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_gateway_1.RealtimeGateway])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map