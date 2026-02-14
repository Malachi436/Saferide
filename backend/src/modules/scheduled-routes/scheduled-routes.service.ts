import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DayOfWeek, ScheduleStatus } from '@prisma/client';

@Injectable()
export class ScheduledRoutesService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    routeId: string;
    driverId: string;
    busId: string;
    scheduledTime: string;
    recurringDays: DayOfWeek[];
    effectiveFrom?: Date;
    effectiveUntil?: Date;
  }) {
    return this.prisma.scheduledRoute.create({
      data,
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async findAll() {
    return this.prisma.scheduledRoute.findMany({
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async findBySchool(schoolId: string) {
    return this.prisma.scheduledRoute.findMany({
      where: {
        route: {
          schoolId,
        },
      },
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.scheduledRoute.findUnique({
      where: { id },
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async findActiveForDay(dayOfWeek: DayOfWeek) {
    const now = new Date();
    
    return this.prisma.scheduledRoute.findMany({
      where: {
        status: ScheduleStatus.ACTIVE,
        recurringDays: { has: dayOfWeek },
        OR: [
          { effectiveFrom: null, effectiveUntil: null },
          { effectiveFrom: { lte: now }, effectiveUntil: null },
          { effectiveFrom: null, effectiveUntil: { gte: now } },
          { effectiveFrom: { lte: now }, effectiveUntil: { gte: now } },
        ],
      },
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async update(id: string, data: Partial<{
    routeId: string;
    driverId: string;
    busId: string;
    scheduledTime: string;
    recurringDays: DayOfWeek[];
    status: ScheduleStatus;
    effectiveFrom: Date;
    effectiveUntil: Date;
  }>) {
    return this.prisma.scheduledRoute.update({
      where: { id },
      data,
      include: {
        route: { include: { stops: true, school: true } },
        driver: { include: { user: true } },
        bus: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.scheduledRoute.delete({
      where: { id },
    });
  }

  async suspend(id: string) {
    return this.update(id, { status: ScheduleStatus.SUSPENDED });
  }

  async activate(id: string) {
    return this.update(id, { status: ScheduleStatus.ACTIVE });
  }
}
