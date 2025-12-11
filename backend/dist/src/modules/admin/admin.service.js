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
            select: {
                id: true,
                firstName: true,
                lastName: true,
                parentId: true,
                schoolId: true,
                pickupType: true,
                pickupDescription: true,
                homeLatitude: true,
                homeLongitude: true,
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
                createdAt: true,
                updatedAt: true,
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
    async updateSchool(schoolId, data) {
        return this.prisma.school.update({
            where: { id: schoolId },
            data,
        });
    }
    async deleteSchool(schoolId) {
        await this.prisma.route.deleteMany({
            where: { schoolId },
        });
        await this.prisma.child.deleteMany({
            where: { schoolId },
        });
        return this.prisma.school.delete({
            where: { id: schoolId },
        });
    }
    async getCompanyAnalytics(companyId) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalTrips, completedTrips, inProgressTrips, totalChildren, activeChildren, totalPayments, successfulPayments, missedPickups, onTimeTrips] = await Promise.all([
            this.prisma.trip.count({
                where: { bus: { driver: { user: { companyId } } } },
            }),
            this.prisma.trip.count({
                where: {
                    bus: { driver: { user: { companyId } } },
                    status: 'COMPLETED',
                },
            }),
            this.prisma.trip.count({
                where: {
                    bus: { driver: { user: { companyId } } },
                    status: 'IN_PROGRESS',
                },
            }),
            this.prisma.child.count({
                where: { school: { companyId } },
            }),
            this.prisma.child.count({
                where: {
                    school: { companyId },
                    attendance: {
                        some: {
                            trip: {
                                status: 'IN_PROGRESS',
                            },
                        },
                    },
                },
            }),
            this.prisma.paymentIntent.count({
                where: {
                    parent: { companyId },
                },
            }),
            this.prisma.paymentIntent.count({
                where: {
                    parent: { companyId },
                    status: 'succeeded',
                },
            }),
            this.prisma.childAttendance.count({
                where: {
                    trip: { bus: { driver: { user: { companyId } } } },
                    status: 'MISSED',
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
            this.prisma.trip.count({
                where: {
                    bus: { driver: { user: { companyId } } },
                    status: 'COMPLETED',
                    createdAt: { gte: thirtyDaysAgo },
                },
            }),
        ]);
        const tripCompletionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
        const paymentSuccessRate = totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;
        const attendanceRate = totalChildren > 0 ? ((totalChildren - missedPickups) / totalChildren) * 100 : 100;
        return {
            trips: {
                total: totalTrips,
                completed: completedTrips,
                inProgress: inProgressTrips,
                completionRate: tripCompletionRate,
            },
            children: {
                total: totalChildren,
                active: activeChildren,
            },
            payments: {
                total: totalPayments,
                successful: successfulPayments,
                successRate: paymentSuccessRate,
            },
            attendance: {
                missedPickups,
                rate: attendanceRate,
            },
            performance: {
                onTimeTrips,
                tripCompletionRate,
            },
        };
    }
    async getCompanyTrips(companyId) {
        return this.prisma.trip.findMany({
            where: {
                bus: { driver: { user: { companyId } } },
            },
            include: {
                bus: {
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
                },
                route: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                attendances: {
                    include: {
                        child: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 100,
        });
    }
    async getCompanyActiveTrips(companyId) {
        return this.prisma.trip.findMany({
            where: {
                bus: { driver: { user: { companyId } } },
                status: 'IN_PROGRESS',
            },
            include: {
                bus: {
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
                },
                route: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                attendances: {
                    include: {
                        child: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async getAttendanceReport(companyId, range) {
        const now = new Date();
        let startDate;
        switch (range) {
            case 'daily':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const attendances = await this.prisma.childAttendance.findMany({
            where: {
                trip: { bus: { driver: { user: { companyId } } } },
                timestamp: {
                    gte: startDate,
                },
            },
            include: {
                child: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        parent: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                        school: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                trip: {
                    select: {
                        id: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                        bus: {
                            select: {
                                plateNumber: true,
                            },
                        },
                        route: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                timestamp: 'desc',
            },
            take: 1000,
        });
        return attendances.map((att) => ({
            date: att.timestamp,
            childName: `${att.child.firstName} ${att.child.lastName}`,
            parentName: `${att.child.parent.firstName} ${att.child.parent.lastName}`,
            parentEmail: att.child.parent.email,
            parentPhone: att.child.parent.phone,
            schoolName: att.child.school.name,
            tripRoute: att.trip.route.name,
            busPlate: att.trip.bus.plateNumber,
            status: att.status,
            tripStatus: att.trip.status,
            recordedBy: att.recordedBy,
        }));
    }
    async getPaymentReport(companyId, range) {
        const now = new Date();
        let startDate;
        switch (range) {
            case 'daily':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const payments = await this.prisma.paymentIntent.findMany({
            where: {
                parent: { companyId },
                createdAt: {
                    gte: startDate,
                },
            },
            include: {
                parent: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 1000,
        });
        return payments.map((payment) => ({
            date: payment.createdAt,
            parentName: `${payment.parent.firstName} ${payment.parent.lastName}`,
            parentEmail: payment.parent.email,
            parentPhone: payment.parent.phone,
            amount: payment.amount,
            currency: payment.currency,
            status: payment.status,
            hubtleRef: payment.hubtleRef || 'N/A',
            paymentId: payment.id,
        }));
    }
    async getDriverPerformanceReport(companyId, range) {
        const now = new Date();
        let startDate;
        switch (range) {
            case 'daily':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'weekly':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
        }
        const drivers = await this.prisma.driver.findMany({
            where: {
                user: { companyId },
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                trips: {
                    where: {
                        createdAt: {
                            gte: startDate,
                        },
                    },
                    select: {
                        id: true,
                        status: true,
                        startTime: true,
                        endTime: true,
                        createdAt: true,
                    },
                },
                buses: {
                    select: {
                        plateNumber: true,
                    },
                },
            },
        });
        return drivers.map((driver) => {
            const totalTrips = driver.trips.length;
            const completedTrips = driver.trips.filter((t) => t.status === 'COMPLETED').length;
            const inProgressTrips = driver.trips.filter((t) => t.status === 'IN_PROGRESS').length;
            const completionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
            const onTimeTrips = driver.trips.filter((trip) => {
                if (trip.status === 'COMPLETED' && trip.startTime && trip.endTime) {
                    const duration = new Date(trip.endTime).getTime() - new Date(trip.startTime).getTime();
                    const hours = duration / (1000 * 60 * 60);
                    return hours <= 2;
                }
                return false;
            }).length;
            const onTimeRate = completedTrips > 0 ? (onTimeTrips / completedTrips) * 100 : 0;
            return {
                driverName: `${driver.user.firstName} ${driver.user.lastName}`,
                email: driver.user.email,
                phone: driver.user.phone,
                license: driver.license,
                buses: driver.buses.map((b) => b.plateNumber).join(', '),
                totalTrips,
                completedTrips,
                inProgressTrips,
                completionRate: completionRate.toFixed(2),
                onTimeTrips,
                onTimeRate: onTimeRate.toFixed(2),
            };
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map