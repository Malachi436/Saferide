import { Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ChildAttendance, AttendanceStatus, NotificationType } from '@prisma/client';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    @Optional() private realtimeGateway?: RealtimeGateway,
  ) {}

  // Map status to human-readable text
  private getStatusText(status: AttendanceStatus): string {
    switch (status) {
      case 'PICKED_UP': return 'picked up';
      case 'DROPPED': return 'dropped off at school';
      case 'MISSED': return 'missed';
      case 'PENDING': return 'waiting for pickup';
    }
  }

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
    // Get current attendance to store previous status
    const currentAttendance = await this.prisma.childAttendance.findUnique({
      where: { id },
      include: { child: true },
    });

    const previousStatus = currentAttendance?.status;

    const attendance = await this.prisma.childAttendance.update({
      where: { id },
      data: {
        status,
        recordedBy,
      },
      include: {
        child: true,
        trip: true,
      },
    });

    // Create persistent notification for parent and emit WebSocket event
    try {
      if (attendance.child) {
        const parentUserId = attendance.child.parentId;
        const childName = `${attendance.child.firstName} ${attendance.child.lastName}`;
        const statusText = this.getStatusText(status);

        // Create persistent notification in database
        const notificationType = status === 'PICKED_UP' ? NotificationType.PICKUP : NotificationType.DROPOFF;
        const notificationTitle = status === 'PICKED_UP' ? 'Child Picked Up' : 'Child Dropped Off';
        const notificationMessage = `${childName} has been ${statusText}.`;

        await this.prisma.notification.create({
          data: {
            userId: parentUserId,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
          },
        });

        console.log(`[Attendance] Created notification for parent ${parentUserId}: ${notificationMessage}`);

        // Emit WebSocket event for real-time updates
        if (this.realtimeGateway?.server) {
          const eventData = {
            childId: attendance.childId,
            childName,
            status: attendance.status,
            previousStatus,
            tripId: attendance.tripId,
            timestamp: new Date().toISOString(),
          };

          console.log(`[Attendance] Emitting status update to parent ${parentUserId}:`, eventData);

          // Emit to specific parent
          this.realtimeGateway.server.to(`user:${parentUserId}`).emit('attendance_updated', eventData);
          
          // Also emit to trip room for dashboard updates
          this.realtimeGateway.server.to(`trip:${attendance.tripId}`).emit('attendance_updated', eventData);
          
          // Broadcast to all connected clients (admin dashboards)
          this.realtimeGateway.server.emit('attendance_updated', eventData);
        }
      }
    } catch (error) {
      console.error('[Attendance] Error creating notification or emitting event:', error);
      // Don't fail the entire request if notification fails
    }

    return attendance;
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