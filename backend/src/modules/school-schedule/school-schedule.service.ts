import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ScheduleType } from '@prisma/client';

@Injectable()
export class SchoolScheduleService {
  constructor(private prisma: PrismaService) {}

  async createSchedule(data: {
    schoolId: string;
    title: string;
    description?: string;
    scheduleType: ScheduleType;
    date: Date;
    adjustedStartTime?: Date;
    adjustedEndTime?: Date;
    tripsEnabled?: boolean;
    createdBy?: string;
  }) {
    return this.prisma.schoolSchedule.create({ data });
  }

  async getSchedulesBySchool(schoolId: string, startDate?: Date, endDate?: Date) {
    const where: any = { schoolId };
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    return this.prisma.schoolSchedule.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async getScheduleForDate(schoolId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.schoolSchedule.findFirst({
      where: {
        schoolId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  async updateSchedule(id: string, data: {
    title?: string;
    description?: string;
    scheduleType?: ScheduleType;
    date?: Date;
    adjustedStartTime?: Date;
    adjustedEndTime?: Date;
    tripsEnabled?: boolean;
  }) {
    return this.prisma.schoolSchedule.update({
      where: { id },
      data,
    });
  }

  async deleteSchedule(id: string) {
    return this.prisma.schoolSchedule.delete({
      where: { id },
    });
  }

  /**
   * Send notifications to parents about schedule changes
   */
  async notifyParentsOfScheduleChange(scheduleId: string) {
    const schedule = await this.prisma.schoolSchedule.findUnique({
      where: { id: scheduleId },
      include: { school: true },
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Get all children in the school
    const children = await this.prisma.child.findMany({
      where: { schoolId: schedule.schoolId },
      select: { parentId: true },
    });

    const parentIds = [...new Set(children.map(c => c.parentId).filter(Boolean))];

    // Create notifications for each parent
    for (const parentId of parentIds) {
      if (!parentId) continue;

      let message = '';
      switch (schedule.scheduleType) {
        case ScheduleType.EARLY_DISMISSAL:
          message = `School will have early dismissal on ${schedule.date.toLocaleDateString()}. ${schedule.adjustedEndTime ? `Buses will run at ${schedule.adjustedEndTime.toLocaleTimeString()}.` : ''}`;
          break;
        case ScheduleType.LATE_START:
          message = `School will start late on ${schedule.date.toLocaleDateString()}. ${schedule.adjustedStartTime ? `Buses will run at ${schedule.adjustedStartTime.toLocaleTimeString()}.` : ''}`;
          break;
        case ScheduleType.HOLIDAY:
          message = `School will be closed on ${schedule.date.toLocaleDateString()} (${schedule.title}). No bus service on this day.`;
          break;
        case ScheduleType.EXAM_DAY:
          message = `Exam day on ${schedule.date.toLocaleDateString()}. Please check with school for adjusted timings.`;
          break;
        case ScheduleType.SPECIAL_EVENT:
          message = `Special event (${schedule.title}) on ${schedule.date.toLocaleDateString()}. ${schedule.description || ''}`;
          break;
      }

      await this.prisma.notification.create({
        data: {
          userId: parentId,
          title: `Schedule Change: ${schedule.title}`,
          message,
          type: 'SCHEDULE_CHANGE',
          relatedEntityType: 'SCHOOL_SCHEDULE',
          relatedEntityId: scheduleId,
        },
      });
    }

    // Mark notification as sent
    await this.prisma.schoolSchedule.update({
      where: { id: scheduleId },
      data: { notificationSent: true },
    });

    return { notified: parentIds.length };
  }
}
