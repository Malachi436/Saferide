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
            include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
        });
    }
    async findByParentId(parentId) {
        return this.prisma.child.findMany({
            where: { parentId },
            include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
        });
    }
    async findBySchoolId(schoolId) {
        return this.prisma.child.findMany({
            where: { schoolId },
            include: { driver: true, school: true },
        });
    }
    async getUnassignedChildrenBySchool(schoolId) {
        return this.prisma.child.findMany({
            where: {
                schoolId,
                parentId: null,
            },
            include: { school: true, driver: true },
        });
    }
    async assignChildToParent(childId, parentId, data) {
        return this.prisma.child.update({
            where: { id: childId },
            data: {
                parentId,
                pickupType: data.pickupType,
                pickupLatitude: data.pickupLatitude,
                pickupLongitude: data.pickupLongitude,
                pickupDescription: data.pickupDescription,
                homeLatitude: data.homeLatitude,
                homeLongitude: data.homeLongitude,
                homeAddress: data.homeAddress,
                colorCode: data.colorCode,
            },
            include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
        });
    }
    async create(data) {
        return this.prisma.child.create({
            data,
            include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
        });
    }
    async update(id, data) {
        return this.prisma.child.update({
            where: { id },
            data,
            include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
        });
    }
    async findAll() {
        return this.prisma.child.findMany({
            include: { driver: true, school: true },
        });
    }
    async remove(id) {
        return this.prisma.child.delete({
            where: { id },
        });
    }
    async createPaymentSubscription(childId, parentId, planId) {
        const plan = await this.prisma.paymentPlan.findUnique({
            where: { id: planId },
        });
        const now = new Date();
        let nextDueDate = new Date(now);
        if (plan.frequency === 'daily') {
            nextDueDate.setDate(nextDueDate.getDate() + 1);
        }
        else if (plan.frequency === 'weekly') {
            nextDueDate.setDate(nextDueDate.getDate() + 7);
        }
        else if (plan.frequency === 'monthly') {
            nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }
        return this.prisma.childPaymentSubscription.create({
            data: {
                childId,
                parentId,
                planId,
                nextDueDate,
            },
            include: { plan: true, child: true },
        });
    }
    async getDaysUntilPaymentDue(childId) {
        const subscription = await this.prisma.childPaymentSubscription.findFirst({
            where: { childId, status: 'ACTIVE' },
        });
        if (!subscription)
            return null;
        const now = new Date();
        const daysRemaining = Math.ceil((subscription.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysRemaining);
    }
};
exports.ChildrenService = ChildrenService;
exports.ChildrenService = ChildrenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChildrenService);
//# sourceMappingURL=children.service.js.map