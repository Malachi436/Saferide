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
let AttendanceService = class AttendanceService {
    constructor(prisma) {
        this.prisma = prisma;
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
        return this.prisma.childAttendance.update({
            where: { id },
            data: {
                status,
                recordedBy,
            },
        });
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map