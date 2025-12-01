import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    @Optional() private realtimeGateway?: RealtimeGateway,
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
    // Get the attendance record with trip info before updating
    const attendance = await this.prisma.childAttendance.findUnique({
      where: { id },
      include: { trip: true },
    });

    const updated = await this.prisma.childAttendance.update({
      where: { id },
      data: {
        status,
        recordedBy,
      },
      include: { trip: true },
    });

    // Emit WebSocket event for real-time update
    if (attendance && this.realtimeGateway) {
      await this.realtimeGateway.emitAttendanceStatusChange(
        attendance.tripId,
        attendance.childId,
        status,
      );
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
    const attendance = await this.recordAttendance(childId, tripId, AttendanceStatus.MISSED, recordedBy);
    
    // Emit WebSocket event
    if (this.realtimeGateway) {
      await this.realtimeGateway.emitAttendanceStatusChange(
        tripId,
        childId,
        AttendanceStatus.MISSED,
      );
    }
    
    return attendance;
  }

  // Method to unmark attendance (undo)
  async unmarkAttendance(childId: string, tripId: string, recordedBy: string): Promise<ChildAttendance> {
    // Find existing attendance
    const existing = await this.prisma.childAttendance.findUnique({
      where: { childId_tripId: { childId, tripId } },
    });

    if (!existing) {
      throw new Error('Attendance record not found');
    }

    // Revert to PENDING
    const updated = await this.prisma.childAttendance.update({
      where: { id: existing.id },
      data: {
        status: AttendanceStatus.PENDING,
        recordedBy,
      },
    });

    // Emit WebSocket event
    if (this.realtimeGateway) {
      await this.realtimeGateway.emitAttendanceStatusChange(
        tripId,
        childId,
        AttendanceStatus.PENDING,
      );
    }

    return updated;
  }
}