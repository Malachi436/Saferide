import { Injectable, Optional, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class TripExceptionsService {
  constructor(
    private prisma: PrismaService,
    @Optional() private realtimeGateway?: RealtimeGateway,
    @Optional() private notificationsService?: NotificationsService,
  ) {}

  // Skip a trip (create or update exception)
  async skipTrip(childId: string, tripId: string, reason?: string): Promise<any> {
    const exception = await this.prisma.tripException.upsert({
      where: { childId_tripId: { childId, tripId } },
      update: {
        reason,
        status: 'ACTIVE',
        requestedAt: new Date(),
      },
      create: {
        childId,
        tripId,
        date: new Date(),
        type: 'SKIP_TRIP',
        reason,
        status: 'ACTIVE',
      },
      include: {
        child: true,
      },
    });

    // Notify driver via WebSocket
    if (this.realtimeGateway) {
      await this.realtimeGateway.server.to(`trip:${tripId}`).emit('trip_skip_requested', {
        childId: exception.child.id,
        childName: `${exception.child.firstName} ${exception.child.lastName}`,
        reason,
        timestamp: new Date(),
      });
    }

    return exception;
  }

  // Cancel a skip
  async cancelSkipTrip(childId: string, tripId: string): Promise<any> {
    return this.prisma.tripException.update({
      where: { childId_tripId: { childId, tripId } },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  // Get all active exceptions for a trip
  async getTripExceptions(tripId: string): Promise<any[]> {
    return this.prisma.tripException.findMany({
      where: {
        tripId,
        status: 'ACTIVE',
      },
      include: {
        child: true,
      },
    });
  }

  // Get exception history for a child
  async getChildExceptions(childId: string): Promise<any[]> {
    return this.prisma.tripException.findMany({
      where: { childId },
      include: {
        trip: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  // Filter exceptions by specific date
  async getExceptionsByDate(date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.tripException.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: 'ACTIVE',
      },
      include: {
        child: true,
        trip: true,
      },
    });
  }

  // Unskip a trip (emergency re-add to bus route)
  async unskipTrip(childId: string, tripId: string, parentId: string, reason?: string): Promise<any> {
    // Verify trip exists and is in progress
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        driver: {
          include: {
            user: true,
          },
        },
        bus: true,
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.status === 'COMPLETED') {
      throw new BadRequestException('Cannot unskip a completed trip');
    }

    // Find and cancel the skip exception
    const exception = await this.prisma.tripException.findUnique({
      where: { childId_tripId: { childId, tripId } },
      include: {
        child: {
          include: {
            parent: true,
          },
        },
      },
    });

    if (!exception || exception.status !== 'ACTIVE') {
      throw new NotFoundException('No active skip found for this child and trip');
    }

    // Cancel the exception
    const updatedExcep = await this.prisma.tripException.update({
      where: { childId_tripId: { childId, tripId } },
      data: {
        status: 'CANCELLED',
        reason: `UNSKIPPED: ${reason || 'Emergency pickup requested'}`,
      },
    });

    // Restore child to attendance if not already there
    const existingAttendance = await this.prisma.childAttendance.findUnique({
      where: { childId_tripId: { childId, tripId } },
    });

    if (!existingAttendance) {
      await this.prisma.childAttendance.create({
        data: {
          childId,
          tripId,
          status: 'PENDING',
          timestamp: new Date(),
          recordedBy: parentId,
        },
      });
    } else if (existingAttendance.status === 'MISSED') {
      // Update missed to pending
      await this.prisma.childAttendance.update({
        where: { id: existingAttendance.id },
        data: {
          status: 'PENDING',
          timestamp: new Date(),
        },
      });
    }

    // Notify driver with acknowledgment required
    if (this.notificationsService && trip.driver) {
      const notification = await this.notificationsService.create({
        userId: trip.driver.userId,
        title: '🚨 Emergency Pickup Request',
        message: `${exception.child.firstName} ${exception.child.lastName} needs to be picked up urgently. Parent has un-skipped this trip. ${reason || ''}`,
        type: 'UNSKIP_REQUEST',
        requiresAck: true, // Driver must acknowledge
        relatedEntityType: 'TRIP_EXCEPTION',
        relatedEntityId: exception.id,
        metadata: {
          childId: exception.child.id,
          childName: `${exception.child.firstName} ${exception.child.lastName}`,
          parentName: `${exception.child.parent.firstName} ${exception.child.parent.lastName}`,
          parentPhone: exception.child.parent.phone,
          tripId,
          busId: trip.busId,
          plateNumber: trip.bus.plateNumber,
          pickupLatitude: exception.child.pickupLatitude || exception.child.homeLatitude,
          pickupLongitude: exception.child.pickupLongitude || exception.child.homeLongitude,
          pickupAddress: exception.child.homeAddress,
          urgent: true,
        },
      });

      // Also send real-time WebSocket notification
      if (this.realtimeGateway) {
        await this.realtimeGateway.server.to(`trip:${tripId}`).emit('unskip_request', {
          notificationId: notification.id,
          childId: exception.child.id,
          childName: `${exception.child.firstName} ${exception.child.lastName}`,
          pickupLocation: {
            latitude: exception.child.pickupLatitude || exception.child.homeLatitude,
            longitude: exception.child.pickupLongitude || exception.child.homeLongitude,
            address: exception.child.homeAddress,
          },
          reason,
          timestamp: new Date(),
          urgent: true,
        });
      }
    }

    return {
      success: true,
      message: 'Child successfully unskipped. Driver has been notified.',
      exception: updatedExcep,
      child: exception.child,
    };
  }
}
