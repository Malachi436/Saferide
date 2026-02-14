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

  /**
   * Verify all children on a trip are accounted for
   * Returns list of children who haven't been marked as picked up/dropped
   */
  async verifyTripAttendance(tripId: string): Promise<{
    totalExpected: number;
    totalAccounted: number;
    missing: Array<{
      childId: string;
      childName: string;
      expectedStatus: string;
    }>;
    allAccounted: boolean;
  }> {
    // Get trip with all expected children
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: {
          include: {
            children: {
              where: { isClaimed: true },
            },
          },
        },
        attendances: true,
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    const expectedChildren = trip.route.children;
    const attendedChildren = trip.attendances;

    // Find children not yet marked as picked up or dropped
    const missing = expectedChildren
      .filter(child => {
        const attendance = attendedChildren.find(a => a.childId === child.id);
        // Child is missing if no attendance or still pending
        return !attendance || attendance.status === AttendanceStatus.PENDING;
      })
      .map(child => ({
        childId: child.id,
        childName: `${child.firstName} ${child.lastName}`,
        expectedStatus: trip.status === 'RETURN_IN_PROGRESS' ? 'DROPPED' : 'PICKED_UP',
      }));

    return {
      totalExpected: expectedChildren.length,
      totalAccounted: expectedChildren.length - missing.length,
      missing,
      allAccounted: missing.length === 0,
    };
  }

  /**
   * Alert when child remains on bus after trip ends
   * This is a critical safety feature - triggers emergency notification
   */
  async checkForChildrenLeftOnBus(tripId: string): Promise<{
    childrenLeftOnBus: Array<{
      childId: string;
      childName: string;
      parentContact: string | null;
    }>;
    alertTriggered: boolean;
  }> {
    const verification = await this.verifyTripAttendance(tripId);
    
    if (!verification.allAccounted) {
      // Get parent contact info for missing children
      const childrenOnBus = await Promise.all(
        verification.missing.map(async (m) => {
          const child = await this.prisma.child.findUnique({
            where: { id: m.childId },
            include: { parent: true },
          });
          return {
            childId: m.childId,
            childName: m.childName,
            parentContact: child?.parent?.phone || child?.parentPhone || null,
          };
        })
      );

      // Create critical alert notification to school admin
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
        include: {
          route: true,
          driver: { include: { user: true } },
          bus: true,
        },
      });

      if (trip) {
        // Notify school admin
        const schoolAdmins = await this.prisma.user.findMany({
          where: {
            schoolId: trip.route.schoolId,
            role: 'SCHOOL_ADMIN',
          },
        });

        for (const admin of schoolAdmins) {
          await this.prisma.notification.create({
            data: {
              userId: admin.id,
              title: 'CRITICAL: Children Left on Bus',
              message: `${verification.missing.length} child(ren) may still be on bus ${trip.bus.plateNumber} on trip ${trip.route.name}. Please verify immediately.`,
              type: NotificationType.ALERT,
              requiresAck: true,
              relatedEntityType: 'TRIP',
              relatedEntityId: tripId,
            },
          });
        }

        // Also notify driver
        await this.prisma.notification.create({
          data: {
            userId: trip.driver.userId,
            title: 'CRITICAL: Verify Bus is Empty',
            message: `Please perform a final sweep of the bus. ${verification.missing.length} child(ren) are not accounted for on trip ${trip.route.name}.`,
            type: NotificationType.ALERT,
            requiresAck: true,
            relatedEntityType: 'TRIP',
            relatedEntityId: tripId,
          },
        });
      }

      return {
        childrenLeftOnBus: childrenOnBus,
        alertTriggered: true,
      };
    }

    return {
      childrenLeftOnBus: [],
      alertTriggered: false,
    };
  }
}