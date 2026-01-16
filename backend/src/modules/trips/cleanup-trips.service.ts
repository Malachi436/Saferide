import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TripCleanupService {
  private readonly logger = new Logger(TripCleanupService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Clean up old completed trips (runs daily at 3 AM)
   * Keeps completed trips for 7 days, then deletes them
   */
  @Cron('0 3 * * *')
  async cleanupOldTrips() {
    this.logger.log('[TripCleanup] Starting cleanup of old completed trips...');

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Find old completed trips
      const oldTrips = await this.prisma.trip.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: sevenDaysAgo,
          },
        },
        select: {
          id: true,
        },
      });

      if (oldTrips.length === 0) {
        this.logger.log('[TripCleanup] No old completed trips to clean up');
        return;
      }

      this.logger.log(`[TripCleanup] Found ${oldTrips.length} old completed trips to delete`);

      const tripIds = oldTrips.map(t => t.id);

      // Delete attendance records first (FK constraint)
      const deletedAttendances = await this.prisma.childAttendance.deleteMany({
        where: {
          tripId: { in: tripIds },
        },
      });

      this.logger.log(`[TripCleanup] Deleted ${deletedAttendances.count} attendance records`);

      // Delete trip history records
      const deletedHistory = await this.prisma.tripHistory.deleteMany({
        where: {
          tripId: { in: tripIds },
        },
      });

      this.logger.log(`[TripCleanup] Deleted ${deletedHistory.count} trip history records`);

      // Delete the trips
      const deletedTrips = await this.prisma.trip.deleteMany({
        where: {
          id: { in: tripIds },
        },
      });

      this.logger.log(`[TripCleanup] ✓ Deleted ${deletedTrips.count} old completed trips`);

      return {
        success: true,
        tripsDeleted: deletedTrips.count,
        attendancesDeleted: deletedAttendances.count,
        historiesDeleted: deletedHistory.count,
      };
    } catch (error) {
      this.logger.error(`[TripCleanup] Error cleaning up trips: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Manual cleanup trigger (for testing or admin use)
   */
  async manualCleanup(daysOld: number = 7) {
    this.logger.log(`[TripCleanup] Manual cleanup triggered for trips older than ${daysOld} days`);

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldTrips = await this.prisma.trip.findMany({
      where: {
        status: 'COMPLETED',
        updatedAt: {
          lt: cutoffDate,
        },
      },
      select: {
        id: true,
      },
    });

    if (oldTrips.length === 0) {
      return {
        success: true,
        message: 'No old completed trips found to clean up',
        tripsDeleted: 0,
      };
    }

    const tripIds = oldTrips.map(t => t.id);

    // Delete in transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.childAttendance.deleteMany({
        where: { tripId: { in: tripIds } },
      });

      await tx.tripHistory.deleteMany({
        where: { tripId: { in: tripIds } },
      });

      await tx.trip.deleteMany({
        where: { id: { in: tripIds } },
      });
    });

    this.logger.log(`[TripCleanup] Manual cleanup completed: ${oldTrips.length} trips deleted`);

    return {
      success: true,
      message: `Deleted ${oldTrips.length} completed trips older than ${daysOld} days`,
      tripsDeleted: oldTrips.length,
    };
  }
}

