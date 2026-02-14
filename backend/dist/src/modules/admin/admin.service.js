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
const notifications_service_1 = require("../notifications/notifications.service");
const bcrypt = __importStar(require("bcrypt"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let AdminService = class AdminService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async getPlatformStats() {
        const [totalSchools, totalUsers, totalDrivers, totalChildren, totalBuses, totalRoutes, totalTrips,] = await Promise.all([
            this.prisma.school.count(),
            this.prisma.user.count(),
            this.prisma.driver.count(),
            this.prisma.child.count(),
            this.prisma.bus.count(),
            this.prisma.route.count(),
            this.prisma.trip.count(),
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
    async getSchoolStats(schoolId, user) {
        const school = await this.prisma.school.findUnique({ where: { id: schoolId } });
        if (!school) {
            throw new common_1.NotFoundException('School not found');
        }
        const [totalUsers, totalDrivers, totalChildren, totalBuses, totalRoutes, totalTrips,] = await Promise.all([
            this.prisma.user.count({ where: { schoolId } }),
            this.prisma.driver.count({ where: { user: { schoolId } } }),
            this.prisma.child.count({ where: { schoolId } }),
            this.prisma.bus.count({ where: { schoolId } }),
            this.prisma.route.count({ where: { schoolId } }),
            this.prisma.trip.count({ where: { route: { schoolId } } }),
        ]);
        return {
            totalUsers,
            totalDrivers,
            totalChildren,
            totalBuses,
            totalRoutes,
            totalTrips,
        };
    }
    async createCompany(data) {
        throw new common_1.BadRequestException('Companies are no longer supported. Schools are now independent.');
    }
    async createSchool(data) {
        const { adminEmail, adminPassword, adminFirstName, adminLastName, ...schoolData } = data;
        const school = await this.prisma.school.create({
            data: schoolData,
        });
        if (adminEmail && adminPassword && adminFirstName && adminLastName) {
            const passwordHash = await bcrypt.hash(adminPassword, 10);
            await this.prisma.user.create({
                data: {
                    email: adminEmail,
                    passwordHash,
                    firstName: adminFirstName,
                    lastName: adminLastName,
                    role: 'SCHOOL_ADMIN',
                    schoolId: school.id,
                },
            });
        }
        return school;
    }
    async getAllSchools() {
        return this.prisma.school.findMany();
    }
    async getCompanySchools(schoolId) {
        return this.prisma.school.findMany({
            where: { id: schoolId },
        });
    }
    async getSchoolRoutes(schoolId) {
        return this.prisma.route.findMany({
            where: {
                schoolId,
            },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                bus: {
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
                },
                stops: {
                    orderBy: {
                        order: 'asc',
                    },
                },
                _count: {
                    select: {
                        children: true,
                    },
                },
            },
        });
    }
    async getSchoolChildren(schoolId) {
        return this.prisma.child.findMany({
            where: {
                schoolId,
            },
            select: {
                id: true,
                uniqueCode: true,
                firstName: true,
                lastName: true,
                grade: true,
                dateOfBirth: true,
                parentId: true,
                parentPhone: true,
                schoolId: true,
                pickupType: true,
                pickupDescription: true,
                pickupLatitude: true,
                pickupLongitude: true,
                homeLatitude: true,
                homeLongitude: true,
                isClaimed: true,
                daysUntilPayment: true,
                allergies: true,
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
                route: {
                    select: {
                        id: true,
                        name: true,
                        bus: {
                            select: {
                                id: true,
                                plateNumber: true,
                            },
                        },
                    },
                },
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getChildrenPaymentStatus(schoolId) {
        const children = await this.prisma.child.findMany({
            where: {
                schoolId,
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
    async getSchoolDrivers(schoolId) {
        return this.prisma.driver.findMany({
            where: {
                user: { schoolId },
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
        throw new common_1.BadRequestException('Companies are no longer supported');
    }
    async deleteCompany(companyId) {
        throw new common_1.BadRequestException('Companies are no longer supported');
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
    async getSchoolAnalytics(schoolId, range) {
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
        const [totalTrips, completedTrips, inProgressTrips, totalChildren, activeChildren] = await Promise.all([
            this.prisma.trip.count({
                where: {
                    route: { schoolId },
                    createdAt: { gte: startDate },
                },
            }),
            this.prisma.trip.count({
                where: {
                    route: { schoolId },
                    status: 'COMPLETED',
                    createdAt: { gte: startDate },
                },
            }),
            this.prisma.trip.count({
                where: {
                    route: { schoolId },
                    status: 'IN_PROGRESS',
                    createdAt: { gte: startDate },
                },
            }),
            this.prisma.child.count({
                where: { schoolId },
            }),
            this.prisma.child.count({
                where: {
                    schoolId,
                },
            }),
            this.prisma.trip.count({
                where: {
                    route: { schoolId },
                    status: 'COMPLETED',
                    createdAt: { gte: startDate },
                },
            }),
        ]);
        const tripCompletionRate = totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0;
        const attendanceRate = totalChildren > 0 ? (activeChildren / totalChildren) * 100 : 100;
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
            attendance: {
                rate: attendanceRate,
            },
        };
    }
    async getSchoolTrips(schoolId) {
        return this.prisma.trip.findMany({
            where: {
                route: { schoolId },
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
    async getSchoolActiveTrips(schoolId) {
        return this.prisma.trip.findMany({
            where: {
                route: { schoolId },
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
    async getAttendanceReport(schoolId, range) {
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
                trip: { route: { schoolId } },
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
    async getPaymentReport(schoolId, range) {
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
        const children = await this.prisma.child.findMany({
            where: { schoolId },
            select: { parentId: true },
        });
        const parentIds = [...new Set(children.map(c => c.parentId))];
        const payments = await this.prisma.paymentIntent.findMany({
            where: {
                parentId: { in: parentIds },
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
    async getDriverPerformanceReport(schoolId, range) {
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
                user: { schoolId },
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
    async updateCompanyFare(schoolId, newFare, adminId, reason) {
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
        });
        if (!school) {
            throw new common_1.NotFoundException('School not found');
        }
        const oldFare = school.baseFare;
        const updatedSchool = await this.prisma.school.update({
            where: { id: schoolId },
            data: { baseFare: newFare },
        });
        await this.prisma.fareHistory.create({
            data: {
                schoolId,
                oldFare,
                newFare,
                changedBy: adminId,
                reason,
            },
        });
        const parents = await this.prisma.user.findMany({
            where: {
                role: 'PARENT',
                parentChildren: {
                    some: {
                        schoolId,
                    },
                },
            },
        });
        for (const parent of parents) {
            await this.notificationsService.create({
                userId: parent.id,
                title: 'Fare Update',
                message: `The bus fare has been updated from UGX ${oldFare.toLocaleString()} to UGX ${newFare.toLocaleString()}. ${reason || ''}`,
                type: 'PAYMENT',
                metadata: {
                    oldFare,
                    newFare,
                    change: newFare - oldFare,
                    percentageChange: ((newFare - oldFare) / oldFare * 100).toFixed(2),
                },
            });
        }
        return {
            school: updatedSchool,
            oldFare,
            newFare,
            change: newFare - oldFare,
            parentsNotified: parents.length,
        };
    }
    async getSchoolFare(schoolId) {
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                id: true,
                name: true,
                baseFare: true,
                currency: true,
            },
        });
        if (!school) {
            throw new common_1.NotFoundException('School not found');
        }
        return school;
    }
    async getFareHistory(schoolId) {
        return this.prisma.fareHistory.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], AdminService);
//# sourceMappingURL=admin.service.js.map