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
exports.DriversService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
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
        const { userId, firstName, lastName, email, phone, password, license, companyId, schoolId } = data;
        const existingDriver = await this.findByLicense(license);
        if (existingDriver) {
            throw new common_1.BadRequestException('Driver with this license already exists');
        }
        if (userId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    role: 'DRIVER',
                    companyId,
                },
            });
            return this.prisma.driver.create({
                data: {
                    license,
                    userId,
                },
            });
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email,
                    firstName,
                    lastName,
                    phone,
                    passwordHash,
                    role: 'DRIVER',
                    companyId,
                    schoolId,
                },
            });
            const driver = await tx.driver.create({
                data: {
                    license,
                    userId: user.id,
                },
            });
            return driver;
        });
    }
    async update(id, data) {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }
    async findAll() {
        return this.prisma.driver.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                    },
                },
                buses: true,
            },
        });
    }
    async remove(id) {
        const driver = await this.findOne(id);
        if (!driver) {
            throw new common_1.BadRequestException('Driver not found');
        }
        return this.prisma.$transaction(async (tx) => {
            const deletedDriver = await tx.driver.delete({
                where: { id },
            });
            await tx.user.delete({
                where: { id: driver.userId },
            });
            return deletedDriver;
        });
    }
    async getTodayTrip(driverId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log('[getTodayTrip] Looking for trips for driverId:', driverId);
        console.log('[getTodayTrip] Date range:', today, 'to', tomorrow);
        let trip = await this.prisma.trip.findFirst({
            where: {
                driverId,
                status: 'IN_PROGRESS',
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
        console.log('[getTodayTrip] IN_PROGRESS trip found:', trip?.id || 'none');
        if (!trip) {
            trip = await this.prisma.trip.findFirst({
                where: {
                    driverId,
                    OR: [
                        {
                            createdAt: {
                                gte: today,
                                lt: tomorrow,
                            },
                        },
                        {
                            startTime: {
                                gte: today,
                                lt: tomorrow,
                            },
                        },
                    ],
                    status: {
                        notIn: ['COMPLETED'],
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
            console.log('[getTodayTrip] Today\'s SCHEDULED trip found:', trip?.id || 'none');
        }
        if (!trip) {
            console.log('[getTodayTrip] No trip found for driver');
            return null;
        }
        console.log('[getTodayTrip] Trip found:', trip.id, 'with', trip.attendances?.length || 0, 'attendances');
        if (trip.attendances && trip.attendances.length > 0) {
            const childIds = trip.attendances.map((a) => a.childId);
            const pickupRequests = await this.prisma.earlyPickupRequest.findMany({
                where: {
                    tripId: trip.id,
                    status: 'PENDING',
                    childId: { in: childIds },
                },
                select: { childId: true },
            });
            const tripExceptions = await this.prisma.tripException.findMany({
                where: {
                    tripId: trip.id,
                    status: 'ACTIVE',
                    childId: { in: childIds },
                },
                select: { childId: true },
            });
            const exemptedChildIds = new Set();
            pickupRequests.forEach((req) => {
                exemptedChildIds.add(req.childId);
            });
            tripExceptions.forEach((exc) => {
                exemptedChildIds.add(exc.childId);
            });
            trip.attendances = trip.attendances.filter((attendance) => !exemptedChildIds.has(attendance.childId));
            console.log('[getTodayTrip] After filtering:', trip.attendances.length, 'attendances');
        }
        return trip;
    }
};
exports.DriversService = DriversService;
exports.DriversService = DriversService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DriversService);
//# sourceMappingURL=drivers.service.js.map