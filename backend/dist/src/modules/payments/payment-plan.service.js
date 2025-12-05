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
exports.PaymentPlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PaymentPlanService = class PaymentPlanService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPaymentPlans(companyId) {
        return this.prisma.paymentPlan.findMany({
            where: { companyId },
            orderBy: { amount: 'asc' },
        });
    }
    async createPaymentPlan(companyId, createPaymentPlanDto) {
        return this.prisma.paymentPlan.create({
            data: {
                companyId,
                name: createPaymentPlanDto.name,
                amount: createPaymentPlanDto.amount,
                frequency: createPaymentPlanDto.frequency,
                description: createPaymentPlanDto.description || null,
                features: createPaymentPlanDto.features || [],
                isActive: true,
            },
        });
    }
    async updatePaymentPlan(id, updatePaymentPlanDto) {
        const paymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id } });
        if (!paymentPlan) {
            throw new common_1.NotFoundException(`Payment plan ${id} not found`);
        }
        return this.prisma.paymentPlan.update({
            where: { id },
            data: {
                ...(updatePaymentPlanDto.name && { name: updatePaymentPlanDto.name }),
                ...(updatePaymentPlanDto.amount && { amount: updatePaymentPlanDto.amount }),
                ...(updatePaymentPlanDto.frequency && { frequency: updatePaymentPlanDto.frequency }),
                ...(updatePaymentPlanDto.description !== undefined && {
                    description: updatePaymentPlanDto.description,
                }),
                ...(updatePaymentPlanDto.features && { features: updatePaymentPlanDto.features }),
                ...(updatePaymentPlanDto.isActive !== undefined && {
                    isActive: updatePaymentPlanDto.isActive,
                }),
            },
        });
    }
    async deletePaymentPlan(id) {
        const paymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id } });
        if (!paymentPlan) {
            throw new common_1.NotFoundException(`Payment plan ${id} not found`);
        }
        return this.prisma.paymentPlan.delete({ where: { id } });
    }
};
exports.PaymentPlanService = PaymentPlanService;
exports.PaymentPlanService = PaymentPlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentPlanService);
//# sourceMappingURL=payment-plan.service.js.map