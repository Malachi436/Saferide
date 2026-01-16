import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { DayOfWeek, ScheduleStatus } from '@prisma/client';

@Injectable()
export class TripAutomationService {
  private readonly logger = new Logger(TripAutomationService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Runs every day at 2:00 AM to create trips for the day
   * This gives enough time after midnight for any late-night updates
   * and ensures trips are ready when drivers start their morning routine
   */
  @Cron('0 2 * * *') // Every day at 2:00 AM
  async generateDailyTrips() {
    this.logger.log('Starting daily trip generation...');

    try {
      const today = new Date();
      const dayOfWeek = this.getDayOfWeek(today);

      this.logger.log(`Generating trips for ${dayOfWeek}`);

      // Get all active scheduled routes for today
      const scheduledRoutes = await this.prisma.scheduledRoute.findMany({
        where: {
          status: ScheduleStatus.ACTIVE,
          recurringDays: { has: dayOfWeek },
          OR: [
            { effectiveFrom: null, effectiveUntil: null },
            { effectiveFrom: { lte: today }, effectiveUntil: null },
            { effectiveFrom: null, effectiveUntil: { gte: today } },
            { effectiveFrom: { lte: today }, effectiveUntil: { gte: today } },
          ],
        },
        include: {
          route: { include: { stops: true, school: true } },
          driver: true,
          bus: true,
        },
      });

      this.logger.log(`Found ${scheduledRoutes.length} scheduled routes for today`);

      for (const schedule of scheduledRoutes) {
        try {
          await this.createTripFromSchedule(schedule, today);
        } catch (error) {
          this.logger.error(
            `Failed to create trip for schedule ${schedule.id}: ${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('Daily trip generation completed');
    } catch (error) {
      this.logger.error(`Error in daily trip generation: ${error.message}`, error.stack);
    }
  }

  /**
   * Create a trip from a scheduled route
   */
  private async createTripFromSchedule(schedule: any, date: Date) {
    const [hours, minutes] = schedule.scheduledTime.split(':');
    const startTime = new Date(date);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Verify all required entities exist
    if (!schedule.driverId) {
      this.logger.error(`Cannot create trip for route ${schedule.route.name}: No driver assigned to schedule`);
      throw new Error(`Schedule ${schedule.id} has no driver assigned`);
    }

    if (!schedule.busId) {
      this.logger.error(`Cannot create trip for route ${schedule.route.name}: No bus assigned to schedule`);
      throw new Error(`Schedule ${schedule.id} has no bus assigned`);
    }

    this.logger.log(`Creating trip for route ${schedule.route.name} at ${schedule.scheduledTime} - Driver: ${schedule.driver.user.firstName} ${schedule.driver.user.lastName}, Bus: ${schedule.bus.plateNumber}`);

    // Create the trip with validated driver and bus
    const trip = await this.prisma.trip.create({
      data: {
        busId: schedule.busId,
        routeId: schedule.routeId,
        driverId: schedule.driverId,
        status: 'SCHEDULED',
        startTime,
      },
    });

    this.logger.log(`✓ Created trip ${trip.id} for route ${schedule.route.name} - Driver: ${schedule.driverId}`);

    // Auto-assign children if enabled
    if (schedule.autoAssignChildren) {
      await this.assignChildrenToTrip(trip.id, schedule.routeId, schedule.route.schoolId);
    }

    return trip;
  }

  /**
   * Automatically assign children to a trip based on their route assignment
   */
  private async assignChildrenToTrip(tripId: string, routeId: string, schoolId: string) {
    try {
      // Get all CLAIMED children assigned to this specific route
      const children = await this.prisma.child.findMany({
        where: { 
          routeId: routeId,
          isClaimed: true, // Only assign claimed children
        },
      });

      this.logger.log(`Found ${children.length} children assigned to route ${routeId} for trip ${tripId}`);

      if (children.length === 0) {
        this.logger.warn(`No children assigned to route ${routeId}, skipping child assignment`);
        return;
      }

      this.logger.log(`Assigning ${children.length} children to trip ${tripId}`);

      // Create attendance records for all children on this route
      for (const child of children) {
        // Check if attendance already exists (prevent duplicates)
        const existingAttendance = await this.prisma.childAttendance.findUnique({
          where: {
            childId_tripId: {
              childId: child.id,
              tripId,
            },
          },
        });

        if (!existingAttendance) {
          await this.prisma.childAttendance.create({
            data: {
              childId: child.id,
              tripId,
              status: 'PENDING', // Default status - driver will update when picking up
              recordedBy: 'SYSTEM', // System-generated attendance
            },
          });
        }
      }

      this.logger.log(`Successfully assigned ${children.length} children to trip ${tripId}`);
    } catch (error) {
      this.logger.error(`Error assigning children to trip ${tripId}: ${error.message}`);
      throw error;
    }
  }

  // Removed: No longer needed - children are assigned by routeId, not geo-matching

  /**
   * Get day of week as enum
   */
  private getDayOfWeek(date: Date): DayOfWeek {
    const days: DayOfWeek[] = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[date.getDay()];
  }

  /**
   * Manual trigger for testing (can be called via endpoint)
   */
  async generateTripsManually() {
    this.logger.log('Manual trip generation triggered');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if trips already exist for today
    const existingTrips = await this.prisma.trip.findMany({
      where: {
        startTime: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 1,
    });

    if (existingTrips.length > 0) {
      const firstTrip = existingTrips[0];
      const createdAt = firstTrip.createdAt;
      const createdHour = createdAt.getHours();
      
      // Check if trips were auto-generated (at 2:00 AM)
      const wasAutoGenerated = createdHour === 2;
      
      if (wasAutoGenerated) {
        return {
          success: false,
          message: 'Trips have already been automatically generated for today at 2:00 AM.',
          generatedAt: createdAt.toISOString(),
          generationType: 'automatic',
          existingTripsCount: await this.prisma.trip.count({
            where: {
              startTime: { gte: today, lt: tomorrow },
            },
          }),
        };
      } else {
        return {
          success: false,
          message: `Trips have already been manually generated for today at ${createdAt.toLocaleTimeString()}.`,
          generatedAt: createdAt.toISOString(),
          generationType: 'manual',
          existingTripsCount: await this.prisma.trip.count({
            where: {
              startTime: { gte: today, lt: tomorrow },
            },
          }),
        };
      }
    }

    // No existing trips, proceed with generation
    await this.generateDailyTrips();
    
    const newTripsCount = await this.prisma.trip.count({
      where: {
        startTime: { gte: today, lt: tomorrow },
      },
    });

    return {
      success: true,
      message: `Successfully generated ${newTripsCount} trip(s) for today.`,
      generatedAt: new Date().toISOString(),
      generationType: 'manual',
      tripsCreated: newTripsCount,
    };
  }
}
