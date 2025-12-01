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
exports.ChildrenService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ChildrenService = class ChildrenService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findOne(id) {
        return this.prisma.child.findUnique({
            where: { id },
        });
    }
    async findByParentId(parentId) {
        return this.prisma.child.findMany({
            where: { parentId },
        });
    }
    async findBySchoolId(schoolId) {
        return this.prisma.child.findMany({
            where: { schoolId },
        });
    }
    async create(data) {
        return this.prisma.child.create({
            data,
        });
    }
    async update(id, data) {
        return this.prisma.child.update({
            where: { id },
            data,
        });
    }
    async findAll() {
        return this.prisma.child.findMany();
    }
    async remove(id) {
        return this.prisma.child.delete({
            where: { id },
        });
    }
    async getTrackingData(childId, tripId) {
        const child = await this.prisma.child.findUnique({
            where: { id: childId },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true,
                        latitude: true,
                        longitude: true,
                        address: true,
                    },
                },
            },
        });
        if (!child) {
            throw new Error('Child not found');
        }
        let currentTrip = null;
        if (tripId) {
            currentTrip = await this.prisma.trip.findUnique({
                where: { id: tripId },
                include: {
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                        },
                    },
                    route: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            currentTrip = await this.prisma.trip.findFirst({
                where: {
                    attendances: {
                        some: { childId },
                    },
                    startTime: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
                include: {
                    bus: {
                        select: {
                            id: true,
                            plateNumber: true,
                        },
                    },
                    route: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        let attendanceStatus = 'PENDING';
        if (currentTrip) {
            const attendance = await this.prisma.childAttendance.findUnique({
                where: { childId_tripId: { childId, tripId: currentTrip.id } },
            });
            if (attendance) {
                attendanceStatus = attendance.status;
            }
        }
        return {
            child: {
                id: child.id,
                name: `${child.firstName} ${child.lastName}`,
                colorCode: child.colorCode,
            },
            home: {
                latitude: child.homeLatitude,
                longitude: child.homeLongitude,
                address: child.homeAddress,
            },
            school: {
                id: child.school.id,
                name: child.school.name,
                latitude: child.school.latitude,
                longitude: child.school.longitude,
                address: child.school.address,
            },
            currentTrip: currentTrip ? {
                id: currentTrip.id,
                status: currentTrip.status,
                busId: currentTrip.bus.id,
                busPlateNumber: currentTrip.bus.plateNumber,
                routeName: currentTrip.route.name,
            } : null,
            attendanceStatus,
        };
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map