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
exports.ScheduledRoutesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ScheduledRoutesService = class ScheduledRoutesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.scheduledRoute.create({
            data,
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async findAll() {
        return this.prisma.scheduledRoute.findMany({
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async findBySchool(schoolId) {
        return this.prisma.scheduledRoute.findMany({
            where: {
                route: {
                    schoolId,
                },
            },
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async findOne(id) {
        return this.prisma.scheduledRoute.findUnique({
            where: { id },
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async findActiveForDay(dayOfWeek) {
        const now = new Date();
        return this.prisma.scheduledRoute.findMany({
            where: {
                status: client_1.ScheduleStatus.ACTIVE,
                recurringDays: { has: dayOfWeek },
                OR: [
                    { effectiveFrom: null, effectiveUntil: null },
                    { effectiveFrom: { lte: now }, effectiveUntil: null },
                    { effectiveFrom: null, effectiveUntil: { gte: now } },
                    { effectiveFrom: { lte: now }, effectiveUntil: { gte: now } },
                ],
            },
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.scheduledRoute.update({
            where: { id },
            data,
            include: {
                route: { include: { stops: true, school: true } },
                driver: { include: { user: true } },
                bus: true,
            },
        });
    }
    async delete(id) {
        return this.prisma.scheduledRoute.delete({
            where: { id },
        });
    }
    async suspend(id) {
        return this.update(id, { status: client_1.ScheduleStatus.SUSPENDED });
    }
    async activate(id) {
        return this.update(id, { status: client_1.ScheduleStatus.ACTIVE });
    }
};
exports.ScheduledRoutesService = ScheduledRoutesService;
exports.ScheduledRoutesService = ScheduledRoutesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ScheduledRoutesService);
//# sourceMappingURL=scheduled-routes.service.js.map