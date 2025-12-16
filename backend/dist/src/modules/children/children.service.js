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
const client_1 = require("@prisma/client");
const notifications_service_1 = require("../notifications/notifications.service");
let ChildrenService = class ChildrenService {
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
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
    async bulkOnboard(bulkData) {
        const { companyId, schoolId, children } = bulkData;
        if (!children || !Array.isArray(children) || children.length === 0) {
            throw new common_1.BadRequestException('Children array is required and must not be empty');
        }
        if (!schoolId) {
            throw new common_1.BadRequestException('School ID is required');
        }
        const school = await this.prisma.school.findFirst({
            where: {
                id: schoolId,
                companyId: companyId,
            },
        });
        if (!school) {
            throw new common_1.NotFoundException('School not found or does not belong to this company');
        }
        const createdChildren = await this.prisma.$transaction(children.map((childData) => {
            const uniqueCode = this.generateCodeSync();
            return this.prisma.child.create({
                data: {
                    firstName: childData.firstName,
                    lastName: childData.lastName,
                    dateOfBirth: childData.dateOfBirth ? new Date(childData.dateOfBirth) : new Date(),
                    grade: childData.grade || null,
                    schoolId: schoolId,
                    parentPhone: childData.parentPhone || null,
                    routeId: childData.routeId || null,
                    daysUntilPayment: parseInt(childData.daysUntilPayment) || 0,
                    uniqueCode: uniqueCode,
                    pickupType: 'SCHOOL',
                    isClaimed: false,
                },
            });
        }));
        return {
            created: createdChildren.length,
            children: createdChildren,
        };
    }
    generateCodeSync() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    async update(id, data) {
        const previousChild = await this.prisma.child.findUnique({ where: { id } });
        const updatedChild = await this.prisma.child.update({
            where: { id },
            data,
        });
        if (data.routeId && data.routeId !== previousChild?.routeId) {
            await this.addChildToTodayTrips(id, data.routeId);
        }
        return updatedChild;
    }
    async addChildToTodayTrips(childId, routeId) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const todayTrips = await this.prisma.trip.findMany({
                where: {
                    routeId,
                    startTime: {
                        gte: today,
                        lt: tomorrow,
                    },
                    status: {
                        in: ['SCHEDULED', 'IN_PROGRESS'],
                    },
                },
            });
            for (const trip of todayTrips) {
                const existingAttendance = await this.prisma.childAttendance.findUnique({
                    where: {
                        childId_tripId: {
                            childId,
                            tripId: trip.id,
                        },
                    },
                });
                if (!existingAttendance) {
                    await this.prisma.childAttendance.create({
                        data: {
                            childId,
                            tripId: trip.id,
                            status: 'SCHEDULED',
                            recordedBy: 'system',
                        },
                    });
                    console.log(`Added child ${childId} to trip ${trip.id}`);
                }
            }
            if (todayTrips.length > 0) {
                console.log(`Successfully added child ${childId} to ${todayTrips.length} trip(s) for today`);
            }
        }
        catch (error) {
            console.error(`Error adding child to today's trips:`, error);
        }
    }
    async findAll() {
        return this.prisma.child.findMany();
    }
    async remove(id) {
        return this.prisma.child.delete({
            where: { id },
        });
    }
    async generateUniqueCode() {
        const prefix = 'ROS';
        let code;
        let exists = true;
        while (exists) {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            code = `${prefix}${randomNum}`;
            const existing = await this.prisma.child.findUnique({
                where: { uniqueCode: code },
            });
            exists = !!existing;
        }
        return code;
    }
    async linkChildToParent(parentId, linkDto) {
        const child = await this.prisma.child.findUnique({
            where: { uniqueCode: linkDto.uniqueCode },
        });
        if (!child) {
            throw new common_1.NotFoundException('Invalid child code');
        }
        if (child.isClaimed && child.parentId) {
            throw new common_1.BadRequestException('This child is already linked to a parent');
        }
        const updatedChild = await this.prisma.child.update({
            where: { id: child.id },
            data: {
                parentId,
                isClaimed: true,
                homeLatitude: linkDto.homeLatitude,
                homeLongitude: linkDto.homeLongitude,
                homeAddress: linkDto.homeAddress,
            },
            include: {
                school: true,
                parent: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        return updatedChild;
    }
    async bulkUpdateGrades(companyId, updateDto, adminId) {
        if (updateDto.action === 'PROMOTE') {
            const children = await this.prisma.child.findMany({
                where: {
                    school: {
                        companyId,
                    },
                },
            });
            const gradeMap = {
                'Pre-K': 'Kindergarten',
                'Kindergarten': 'Grade 1',
                'Grade 1': 'Grade 2',
                'Grade 2': 'Grade 3',
                'Grade 3': 'Grade 4',
                'Grade 4': 'Grade 5',
                'Grade 5': 'Grade 6',
                'Grade 6': 'Grade 7',
                'Grade 7': 'Grade 8',
                'Grade 8': 'Grade 9',
                'Grade 9': 'Grade 10',
                'Grade 10': 'Grade 11',
                'Grade 11': 'Grade 12',
                'Grade 12': 'Graduated',
            };
            const updates = [];
            const repeatedIds = new Set(updateDto.repeatedStudentIds || []);
            for (const child of children) {
                if (repeatedIds.has(child.id)) {
                    continue;
                }
                const currentGrade = child.grade || 'Pre-K';
                const newGrade = gradeMap[currentGrade] || currentGrade;
                updates.push(this.prisma.child.update({
                    where: { id: child.id },
                    data: { grade: newGrade },
                }));
            }
            await this.prisma.$transaction(updates);
            return {
                message: 'Grades updated successfully',
                promoted: updates.length,
                repeated: repeatedIds.size,
            };
        }
        else if (updateDto.action === 'CUSTOM' && updateDto.children) {
            const updates = updateDto.children.map((child) => this.prisma.child.update({
                where: { id: child.childId },
                data: { grade: child.newGrade },
            }));
            await this.prisma.$transaction(updates);
            return {
                message: 'Custom grade updates completed',
                updated: updates.length,
            };
        }
        throw new common_1.BadRequestException('Invalid action');
    }
    async requestLocationChange(parentId, requestDto) {
        const child = await this.prisma.child.findUnique({
            where: { id: requestDto.childId },
            include: { parent: true, school: true },
        });
        if (!child) {
            throw new common_1.NotFoundException('Child not found');
        }
        if (child.parentId !== parentId) {
            throw new common_1.BadRequestException('You can only request location changes for your own children');
        }
        const request = await this.prisma.locationChangeRequest.create({
            data: {
                childId: requestDto.childId,
                requestedBy: parentId,
                oldLatitude: child.homeLatitude,
                oldLongitude: child.homeLongitude,
                oldAddress: child.homeAddress,
                newLatitude: requestDto.newLatitude,
                newLongitude: requestDto.newLongitude,
                newAddress: requestDto.newAddress,
                reason: requestDto.reason,
                status: 'PENDING',
            },
        });
        const admins = await this.prisma.user.findMany({
            where: {
                companyId: child.school.companyId,
                role: 'COMPANY_ADMIN',
            },
        });
        for (const admin of admins) {
            await this.notificationsService.create({
                userId: admin.id,
                title: 'Location Change Request',
                message: `${child.parent.firstName} ${child.parent.lastName} has requested a location change for ${child.firstName} ${child.lastName}`,
                type: client_1.NotificationType.LOCATION_CHANGE_REQUEST,
                relatedEntityType: 'LOCATION_CHANGE_REQUEST',
                relatedEntityId: request.id,
                metadata: {
                    childId: child.id,
                    childName: `${child.firstName} ${child.lastName}`,
                    requestId: request.id,
                },
            });
        }
        return request;
    }
    async reviewLocationChangeRequest(requestId, adminId, reviewDto) {
        const request = await this.prisma.locationChangeRequest.findUnique({
            where: { id: requestId },
            include: {
                child: {
                    include: {
                        parent: true,
                        school: true,
                    },
                },
            },
        });
        if (!request) {
            throw new common_1.NotFoundException('Location change request not found');
        }
        if (request.status !== 'PENDING') {
            throw new common_1.BadRequestException('This request has already been reviewed');
        }
        const updatedRequest = await this.prisma.locationChangeRequest.update({
            where: { id: requestId },
            data: {
                status: reviewDto.status,
                reviewedBy: adminId,
                reviewedAt: new Date(),
                reviewNotes: reviewDto.reviewNotes,
                completedAt: reviewDto.status === 'APPROVED' ? new Date() : undefined,
            },
        });
        if (reviewDto.status === 'APPROVED') {
            await this.prisma.child.update({
                where: { id: request.childId },
                data: {
                    homeLatitude: request.newLatitude,
                    homeLongitude: request.newLongitude,
                    homeAddress: request.newAddress,
                },
            });
            await this.notificationsService.create({
                userId: request.requestedBy,
                title: 'Location Change Approved',
                message: `Your location change request for ${request.child.firstName} has been approved. The new location is now active.`,
                type: 'INFO',
            });
        }
        else {
            await this.notificationsService.create({
                userId: request.requestedBy,
                title: 'Location Change Rejected',
                message: `Your location change request for ${request.child.firstName} was not approved. ${reviewDto.reviewNotes || ''}`,
                type: 'WARNING',
            });
        }
        return updatedRequest;
    }
    async getPendingLocationChangeRequests(companyId) {
        return this.prisma.locationChangeRequest.findMany({
            where: {
                status: 'PENDING',
                child: {
                    school: {
                        companyId,
                    },
                },
            },
            include: {
                child: {
                    include: {
                        parent: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true,
                            },
                        },
                        school: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map