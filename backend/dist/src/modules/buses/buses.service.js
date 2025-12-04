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
exports.BusesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let BusesService = class BusesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.bus.findUnique({
            where: { id },
        });
    }
    async findByPlateNumber(plateNumber) {
        return this.prisma.bus.findUnique({
            where: { plateNumber },
        });
    }
    async findByDriverId(driverId) {
        return this.prisma.bus.findMany({
            where: { driverId },
        });
    }
    async create(data) {
        return this.prisma.bus.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.bus.update({
            where: { id },
            data,
        });
    }
    async findAll() {
        return this.prisma.bus.findMany({
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async findByCompanyId(companyId) {
        return this.prisma.bus.findMany({
            where: {
                driver: {
                    user: { companyId },
                },
            },
            include: {
                driver: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async remove(id) {
        return this.prisma.bus.delete({
            where: { id },
        });
    }
};
exports.BusesService = BusesService;
exports.BusesService = BusesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BusesService);
//# sourceMappingURL=buses.service.js.map