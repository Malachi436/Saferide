import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentPlanService {
  constructor(private prisma: PrismaService) {}

  async getPaymentPlans(companyId: string) {
    return this.prisma.paymentPlan.findMany({
      where: { companyId },
      orderBy: { amount: 'asc' },
    });
  }

  async createPaymentPlan(
    companyId: string,
    createPaymentPlanDto: {
      name: string;
      amount: number;
      frequency: string;
      description?: string;
      features?: string[];
    }
  ) {
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

  async updatePaymentPlan(
    id: string,
    updatePaymentPlanDto: {
      name?: string;
      amount?: number;
      frequency?: string;
      description?: string;
      features?: string[];
      isActive?: boolean;
    }
  ) {
    const paymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!paymentPlan) {
      throw new NotFoundException(`Payment plan ${id} not found`);
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

  async deletePaymentPlan(id: string) {
    const paymentPlan = await this.prisma.paymentPlan.findUnique({ where: { id } });
    if (!paymentPlan) {
      throw new NotFoundException(`Payment plan ${id} not found`);
    }

    return this.prisma.paymentPlan.delete({ where: { id } });
  }
}
