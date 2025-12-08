import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async recordAttendance(childId: string, tripId: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance> {
    return this.prisma.childAttendance.create({
      data: {
        childId,
        tripId,
        status,
        recordedBy,
      },
    });
  }

  async updateAttendance(id: string, status: AttendanceStatus, recordedBy: string): Promise<ChildAttendance> {
    return this.prisma.childAttendance.update({
      where: { id },
      data: {
        status,
        recordedBy,
      },
    });
  }

  async getAttendanceByChild(childId: string): Promise<ChildAttendance[]> {
    return this.prisma.childAttendance.findMany({
      where: { childId },
      orderBy: { timestamp: 'desc' },
    });
  }

  async getAttendanceByTrip(tripId: string): Promise<ChildAttendance[]> {
    return this.prisma.childAttendance.findMany({
      where: { tripId },
      include: {
        child: true,
      },
    });
  }

  async getAttendanceById(id: string): Promise<ChildAttendance | null> {
    return this.prisma.childAttendance.findUnique({
      where: { id },
      include: {
        child: true,
        trip: true,
      },
    });
  }

  async markChildAsMissed(childId: string, tripId: string, recordedBy: string): Promise<ChildAttendance> {
    return this.recordAttendance(childId, tripId, AttendanceStatus.MISSED, recordedBy);
  }
}