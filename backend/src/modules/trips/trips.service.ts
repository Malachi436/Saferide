import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Trip, TripStatus, NotificationType } from '@prisma/client';

// Extended type to include new statuses if not available
const ExtendedTripStatus = TripStatus;

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  // Delay reason options
  static readonly DELAY_REASONS = [
    'TRAFFIC',
    'ROAD_CONDITION',
    'WEATHER',
    'VEHICLE_ISSUE',
    'EARLY_PICKUP',
    'OTHER'
  ];

  // Emergency types
  static readonly EMERGENCY_TYPES = [
    'MEDICAL',
    'BREAKDOWN',
    'SAFETY',
    'WEATHER',
    'OTHER'
  ];

  async findOne(id: string): Promise<Trip | null> {
    return this.prisma.trip.findUnique({
      where: { id },
      include: {
        histories: true,
      },
    });
  }

  async create(data: any): Promise<Trip> {
    // Validate that required fields are present
    if (!data.driverId || !data.busId || !data.routeId) {
      throw new Error('Trip must have driverId, busId, and routeId assigned');
    }

    // Verify driver exists
    const driver = await this.prisma.driver.findUnique({
      where: { id: data.driverId },
    });
    if (!driver) {
      throw new Error(`Driver with ID ${data.driverId} not found`);
    }

    // Verify bus exists
    const bus = await this.prisma.bus.findUnique({
      where: { id: data.busId },
    });
    if (!bus) {
      throw new Error(`Bus with ID ${data.busId} not found`);
    }

    // Verify route exists
    const route = await this.prisma.route.findUnique({
      where: { id: data.routeId },
    });
    if (!route) {
      throw new Error(`Route with ID ${data.routeId} not found`);
    }

    console.log(`[TripsService] Creating trip: Driver=${driver.id}, Bus=${bus.id}, Route=${route.id}`);

    return this.prisma.trip.create({
      data,
      include: {
        histories: true,
      },
    });
  }

  async update(id: string, data: any): Promise<Trip> {
    // If updating driver assignment, verify driver exists
    if (data.driverId) {
      const driver = await this.prisma.driver.findUnique({
        where: { id: data.driverId },
      });
      if (!driver) {
        throw new Error(`Driver with ID ${data.driverId} not found`);
      }
      console.log(`[TripsService] Updating trip ${id}: Reassigning to driver ${driver.id}`);
    }

    return this.prisma.trip.update({
      where: { id },
      data,
      include: {
        histories: true,
      },
    });
  }

  async findAll(): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      include: {
        histories: true,
      },
    });
  }

  async findActiveByChildId(childId: string): Promise<Trip | null> {
    return this.prisma.trip.findFirst({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS'] },
        attendances: {
          some: {
            childId: childId,
          },
        },
      },
      include: {
        bus: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
        route: true,
        histories: true,
        attendances: {
          where: { childId: childId },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveBySchoolId(schoolId: string): Promise<Trip[]> {
    return this.prisma.trip.findMany({
      where: {
        status: { in: ['IN_PROGRESS', 'ARRIVED_SCHOOL', 'RETURN_IN_PROGRESS', 'SCHEDULED'] },
        route: {
          schoolId,
        },
      },
      include: {
        bus: {
          include: {
            driver: {
              include: {
                user: true,
              },
            },
          },
        },
        route: true,
        attendances: {
          include: {
            child: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(id: string): Promise<Trip> {
    return this.prisma.trip.delete({
      where: { id },
    });
  }

  async transitionTripStatus(tripId: string, newStatus: TripStatus, userId: string, metadata?: {
    delayMinutes?: number;
    delayReason?: string;
    emergencyType?: string;
    emergencyNote?: string;
  }): Promise<Trip> {
    // Get current trip
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        route: true,
        bus: true,
        driver: { include: { user: true } },
        attendances: { include: { child: { include: { parent: true } } } },
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Validate transition
    if (!this.isValidTransition(trip.status, newStatus)) {
      throw new Error(`Invalid status transition from ${trip.status} to ${newStatus}`);
    }

    // Build update data based on status
    const updateData: any = { status: newStatus };
    
    if (newStatus === TripStatus.IN_PROGRESS) {
      updateData.startTime = new Date();
    } else if (newStatus === TripStatus.COMPLETED) {
      updateData.endTime = new Date();
    } else if (newStatus === TripStatus.DELAYED) {
      // Store delay information
      updateData.delayMinutes = metadata?.delayMinutes || 0;
      updateData.delayReason = metadata?.delayReason || 'Unknown';
      // Store original start time if not already set
      if (!trip.originalStartTime) {
        updateData.originalStartTime = trip.startTime || new Date();
      }
    } else if (newStatus === TripStatus.EMERGENCY) {
      // Store emergency information
      updateData.emergencyType = metadata?.emergencyType || 'OTHER';
      updateData.emergencyNote = metadata?.emergencyNote || '';
    }

    // Update trip status
    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: updateData,
      include: {
        histories: true,
      },
    });

    // Record history
    await this.prisma.tripHistory.create({
      data: {
        tripId: tripId,
        status: newStatus,
      },
    });

    // Send notifications based on status change
    await this.sendStatusNotification(trip, newStatus, metadata);

    return updatedTrip;
  }

  /**
   * Send notifications to parents based on trip status changes
   */
  private async sendStatusNotification(
    trip: Trip & {
      route: any;
      bus: any;
      driver: { user: any };
      attendances: { child: { parent: any; parentId: string | null } }[];
    },
    newStatus: TripStatus,
    metadata?: { delayMinutes?: number; delayReason?: string; emergencyType?: string; emergencyNote?: string }
  ): Promise<void> {
    // Get unique parents of children on this trip
    const parentIds = [...new Set(trip.attendances.map(a => a.child.parentId).filter(Boolean))];
    
    for (const parentId of parentIds) {
      const parent = trip.attendances.find(a => a.child.parentId === parentId)?.child.parent;
      if (!parent) continue;

      let title = '';
      let message = '';
      let type: any = 'TRIP_UPDATE';

      switch (newStatus) {
        case TripStatus.DELAYED:
          title = 'Trip Delayed';
          const delayReason = metadata?.delayReason || 'Traffic conditions';
          const delayMinutes = metadata?.delayMinutes || 0;
          message = `The bus trip for ${trip.route.name} is delayed by approximately ${delayMinutes} minutes. Reason: ${delayReason}. We apologize for the inconvenience.`;
          type = 'DELAY';
          break;

        case TripStatus.EMERGENCY:
          title = 'Emergency Alert';
          const emergencyType = metadata?.emergencyType || 'Other';
          message = `IMPORTANT: There is an emergency situation (${emergencyType}) on the bus trip for ${trip.route.name}. ${metadata?.emergencyNote || 'Please await further updates.'}`;
          type = 'EMERGENCY';
          break;

        case TripStatus.IN_PROGRESS:
          title = 'Trip Started';
          message = `The bus for ${trip.route.name} has started its journey. Track the bus in real-time.`;
          type = 'TRIP_UPDATE';
          break;

        case TripStatus.ARRIVED_SCHOOL:
          title = 'Arrived at School';
          message = `The bus has arrived at the school. ${trip.route.name} trip completed.`;
          type = 'DROPOFF';
          break;

        case TripStatus.COMPLETED:
          title = 'Trip Completed';
          message = `The trip ${trip.route.name} has been completed successfully. Your child is now home.`;
          type = 'DROPOFF';
          break;

        case TripStatus.CANCELLED:
          title = 'Trip Cancelled';
          message = `The trip ${trip.route.name} has been cancelled. Please make alternative arrangements for your child.`;
          type = 'TRIP_UPDATE';
          break;

        default:
          return; // No notification for other statuses
      }

      // Create notification for parent
      await this.prisma.notification.create({
        data: {
          userId: parent.id,
          title,
          message,
          type,
          relatedEntityType: 'TRIP',
          relatedEntityId: trip.id,
        },
      });
    }
  }

  /**
   * Assign a backup driver to a trip
   */
  async assignBackupDriver(tripId: string, backupDriverId: string): Promise<Trip> {
    // Verify backup driver exists
    const backupDriver = await this.prisma.driver.findUnique({
      where: { id: backupDriverId },
      include: { user: true },
    });

    if (!backupDriver) {
      throw new Error(`Backup driver with ID ${backupDriverId} not found`);
    }

    // Get original driver info
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { 
        driver: { include: { user: true } },
        route: true,
      },
    });

    if (!trip) {
      throw new Error('Trip not found');
    }

    // Update trip with backup driver
    const updatedTrip = await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        driverId: backupDriverId, // Replace the driver
        // @ts-ignore - backupDriverId exists in schema but not in cached types
        backupDriverId: trip.driverId, // Keep original as backup reference
      },
    });

    // Notify original driver
    await this.prisma.notification.create({
      data: {
        userId: trip.driver.userId,
        title: 'Trip Reassigned',
        message: `Your trip on ${trip.route.name || 'route'} has been reassigned to another driver due to absence.`,
        // @ts-ignore - TRIP_UPDATE exists in schema but not in cached types
        type: NotificationType.TRIP_UPDATE as any,
        relatedEntityType: 'TRIP',
        relatedEntityId: tripId,
      },
    });

    // Notify backup driver
    await this.prisma.notification.create({
      data: {
        userId: backupDriver.userId,
        title: 'New Trip Assigned',
        message: `You have been assigned as backup driver for the trip on ${trip.route.name || 'route'}. Please check the trip details.`,
        // @ts-ignore - TRIP_UPDATE exists in schema but not in cached types
        type: 'TRIP_UPDATE' as any,
        relatedEntityType: 'TRIP',
        relatedEntityId: tripId,
      },
    });

    return updatedTrip;
  }

  private isValidTransition(from: TripStatus, to: TripStatus): boolean {
    // Define valid transitions
    const validTransitions: Record<TripStatus, TripStatus[]> = {
      [TripStatus.SCHEDULED]: [
        TripStatus.IN_PROGRESS,
        TripStatus.DELAYED,
        TripStatus.EMERGENCY,
        TripStatus.CANCELLED
      ],
      [TripStatus.DELAYED]: [
        TripStatus.IN_PROGRESS,     // Can start after delay is resolved
        TripStatus.CANCELLED       // Can cancel even when delayed
      ],
      [TripStatus.EMERGENCY]: [
        TripStatus.IN_PROGRESS,     // Emergency resolved, continue trip
        TripStatus.COMPLETED,      // Emergency - end trip (return to school)
        TripStatus.CANCELLED       // Cancel trip due to emergency
      ],
      [TripStatus.IN_PROGRESS]: [
        TripStatus.ARRIVED_SCHOOL,
        TripStatus.COMPLETED,      // Allow direct completion
        TripStatus.DELAYED,        // Can become delayed mid-trip
        TripStatus.EMERGENCY,      // Emergency during trip
        TripStatus.CANCELLED       // Can cancel mid-trip
      ],
      [TripStatus.ARRIVED_SCHOOL]: [
        TripStatus.RETURN_IN_PROGRESS,
        TripStatus.CANCELLED
      ],
      [TripStatus.RETURN_IN_PROGRESS]: [
        TripStatus.COMPLETED,
        TripStatus.DELAYED,
        TripStatus.EMERGENCY,
        TripStatus.CANCELLED
      ],
      [TripStatus.COMPLETED]: [],  // Cannot transition from completed
      [TripStatus.CANCELLED]: [],  // Cannot transition from cancelled
    };

    return validTransitions[from]?.includes(to) || false;
  }
}