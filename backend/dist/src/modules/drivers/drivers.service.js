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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DriversService = class DriversService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.driver.findUnique({
            where: { id },
        });
    }
    async findByUserId(userId) {
        return this.prisma.driver.findUnique({
            where: { userId },
        });
    }
    async findByLicense(license) {
        return this.prisma.driver.findUnique({
            where: { license },
        });
    }
    async create(data) {
        return this.prisma.driver.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }
    async findAll() {
        return this.prisma.driver.findMany();
    }
    async remove(id) {
        return this.prisma.driver.delete({
            where: { id },
        });
    }
    async getTodayTrip(driverId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.prisma.trip.findFirst({
            where: {
                driverId,
                startTime: {
                    gte: today,
                    lt: tomorrow,
                },
            },
            include: {
                bus: {
                    include: {
                        locations: true,
                    },
                },
                route: {
                    include: {
                        stops: true,
                    },
                },
                attendances: {
                    include: {
                        child: true,
                    },
                },
            },
        });
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map