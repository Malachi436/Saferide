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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlatformStats() {
        const [totalCompanies, totalSchools, totalUsers, totalDrivers, totalChildren, totalBuses, totalRoutes, totalTrips,] = await Promise.all([
            this.prisma.company.count(),
            this.prisma.school.count(),
            this.prisma.user.count(),
            this.prisma.driver.count(),
            this.prisma.child.count(),
            this.prisma.bus.count(),
            this.prisma.route.count(),
            this.prisma.trip.count(),
        ]);
        return {
            totalCompanies,
            totalSchools,
            totalUsers,
            totalDrivers,
            totalChildren,
            totalBuses,
            totalRoutes,
            totalTrips,
        };
    }
    async getCompanyStats(companyId) {
        const [totalSchools, totalUsers, totalDrivers, totalChildren, totalBuses, totalRoutes, totalTrips,] = await Promise.all([
            this.prisma.school.count({ where: { companyId } }),
            this.prisma.user.count({ where: { companyId } }),
            this.prisma.driver.count({ where: { user: { companyId } } }),
            this.prisma.child.count({ where: { school: { companyId } } }),
            this.prisma.bus.count({ where: { driver: { user: { companyId } } } }),
            this.prisma.route.count({ where: { school: { companyId } } }),
            this.prisma.trip.count({ where: { bus: { driver: { user: { companyId } } } } }),
        ]);
        return {
            totalSchools,
            totalUsers,
            totalDrivers,
            totalChildren,
            totalBuses,
            totalRoutes,
            totalTrips,
        };
    }
    async createCompany(data) {
        return this.prisma.company.create({ data });
    }
    async createSchool(companyId, data) {
        return this.prisma.school.create({
            data: {
                ...data,
                companyId,
            },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map