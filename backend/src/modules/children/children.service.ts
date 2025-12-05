import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Child, ChildPaymentSubscription } from '@prisma/client';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<Child | null> {
    return this.prisma.child.findUnique({
      where: { id },
      include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
    });
  }

  async findByParentId(parentId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: { parentId },
      include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
    });
  }

  async findBySchoolId(schoolId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: { schoolId },
      include: { driver: true, school: true },
    });
  }

  // Get unassigned children for a school (for parent onboarding)
  async getUnassignedChildrenBySchool(schoolId: string): Promise<Child[]> {
    return this.prisma.child.findMany({
      where: {
        schoolId,
        parentId: null, // Not yet assigned to a parent
      },
      include: { school: true, driver: true },
    });
  }

  // Assign existing child to parent
  async assignChildToParent(childId: string, parentId: string, data: any): Promise<Child> {
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

  async create(data: any): Promise<Child> {
    return this.prisma.child.create({
      data,
      include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
    });
  }

  async update(id: string, data: any): Promise<Child> {
    return this.prisma.child.update({
      where: { id },
      data,
      include: { driver: true, paymentSubscriptions: { include: { plan: true } } },
    });
  }

  async findAll(): Promise<Child[]> {
    return this.prisma.child.findMany({
      include: { driver: true, school: true },
    });
  }

  async remove(id: string): Promise<Child> {
    return this.prisma.child.delete({
      where: { id },
    });
  }

  // Create payment subscription for a child
  async createPaymentSubscription(
    childId: string,
    parentId: string,
    planId: string,
  ): Promise<ChildPaymentSubscription> {
    // Get the plan to calculate next due date
    const plan = await this.prisma.paymentPlan.findUnique({
      where: { id: planId },
    });

    const now = new Date();
    let nextDueDate = new Date(now);

    // Calculate next due date based on frequency
    if (plan.frequency === 'daily') {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (plan.frequency === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    } else if (plan.frequency === 'monthly') {
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

  // Get days until payment due
  async getDaysUntilPaymentDue(childId: string): Promise<number | null> {
    const subscription = await this.prisma.childPaymentSubscription.findFirst({
      where: { childId, status: 'ACTIVE' },
    });

    if (!subscription) return null;

    const now = new Date();
    const daysRemaining = Math.ceil(
      (subscription.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return Math.max(0, daysRemaining);
  }
}