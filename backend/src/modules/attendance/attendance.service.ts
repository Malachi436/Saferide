import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

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
    // Get the attendance record with child relationship
    const existing = await this.prisma.childAttendance.findUnique({
      where: { id },
      include: { child: true, trip: true },
    });
    
    if (!existing) {
      throw new Error(`Attendance record ${id} not found`);
    }
    
    // Update the attendance record
    const updated = await this.prisma.childAttendance.update({
      where: { id },
      data: {
        status,
        recordedBy,
      },
    });
    
    // Emit WebSocket event to parent about the status change
    if (existing.child?.parentId) {
      this.realtimeGateway.emitAttendanceUpdate(existing.child.parentId, {
        childId: existing.childId,
        tripId: existing.tripId,
        status,
        timestamp: new Date(),
      });
    }
    
    return updated;
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