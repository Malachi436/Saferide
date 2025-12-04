"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
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
        const { name, email, phone, address, adminName, adminEmail, adminPassword } = data;
        const company = await this.prisma.company.create({
            data: {
                name,
                email,
                phone,
                address,
            },
        });
        if (adminEmail && adminPassword) {
            const passwordHash = await bcrypt.hash(adminPassword, 10);
            await this.prisma.user.create({
                data: {
                    firstName: adminName?.split(' ')[0] || 'Admin',
                    lastName: adminName?.split(' ')[1] || 'User',
                    email: adminEmail,
                    passwordHash,
                    role: 'COMPANY_ADMIN',
                    companyId: company.id,
                },
            });
        }
        return company;
    }
    async createSchool(companyId, data) {
        return this.prisma.school.create({
            data: {
                ...data,
                companyId,
            },
        });
    }
    async getAllCompanies() {
        return this.prisma.company.findMany({
            include: {
                users: true,
                schools: true,
            },
        });
    }
    async getAllSchools() {
        return this.prisma.school.findMany({
            include: {
                company: { select: { id: true, name: true } },
            },
        });
    }
    async getCompanySchools(companyId) {
        return this.prisma.school.findMany({
            where: { companyId },
            include: {
                company: { select: { id: true, name: true } },
            },
        });
    }
    async getCompanyChildren(companyId) {
        return this.prisma.child.findMany({
            where: {
                school: { companyId },
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }
    async getChildrenPaymentStatus(companyId) {
        const children = await this.prisma.child.findMany({
            where: {
                school: { companyId },
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
            },
        });
        return children.map((child) => ({
            childId: child.id,
            totalAmount: 500.0,
            paidAmount: Math.random() > 0.5 ? 500.0 : 250.0,
            pendingAmount: Math.random() > 0.5 ? 0 : 250.0,
            status: Math.random() > 0.7 ? 'OVERDUE' : Math.random() > 0.5 ? 'PENDING' : 'PAID',
        }));
    }
    async getCompanyDrivers(companyId) {
        return this.prisma.driver.findMany({
            where: {
                user: { companyId },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                        phone: true,
                    },
                },
                buses: {
                    select: {
                        id: true,
                        plateNumber: true,
                        capacity: true,
                    },
                },
            },
        });
    }
    async saveDriverPhoto(driverId, file) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'drivers');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filename = `${driverId}-${Date.now()}${path.extname(file.originalname)}`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, file.buffer);
        return {
            message: 'Photo uploaded successfully',
            photoUrl: `/uploads/drivers/${filename}`,
        };
    }
    async getCompanyById(companyId) {
        const company = await this.prisma.company.findUnique({
            where: { id: companyId },
            include: {
                users: true,
                schools: true,
            },
        });
        if (!company)
            return null;
        const buses = await this.prisma.bus.findMany({
            where: { driver: { user: { companyId } } },
        });
        const drivers = await this.prisma.driver.findMany({
            where: { user: { companyId } },
            include: { user: true },
        });
        return {
            ...company,
            buses,
            drivers,
        };
    }
    async deleteCompany(companyId) {
        await this.prisma.childAttendance.deleteMany({
            where: { trip: { bus: { driver: { user: { companyId } } } } },
        });
        await this.prisma.trip.deleteMany({
            where: { bus: { driver: { user: { companyId } } } },
        });
        await this.prisma.scheduledRoute.deleteMany({
            where: { driver: { user: { companyId } } },
        });
        await this.prisma.bus.deleteMany({
            where: { driver: { user: { companyId } } },
        });
        await this.prisma.driver.deleteMany({
            where: { user: { companyId } },
        });
        await this.prisma.route.deleteMany({
            where: { school: { companyId } },
        });
        await this.prisma.school.deleteMany({
            where: { companyId },
        });
        await this.prisma.user.deleteMany({
            where: { companyId },
        });
        return this.prisma.company.delete({
            where: { id: companyId },
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map