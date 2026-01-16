import { PrismaClient, DayOfWeek, ScheduleStatus } from '@prisma/client';
import { Job } from 'bullmq';

const prisma = new PrismaClient();

const DAY_MAP: { [key: number]: DayOfWeek } = {
  0: 'SUNDAY',
  1: 'MONDAY',
  2: 'TUESDAY',
  3: 'WEDNESDAY',
  4: 'THURSDAY',
  5: 'FRIDAY',
  6: 'SATURDAY',
};

export class TripDailyGenerationWorker {
  static async process(job: Job) {
    console.log('[Trip Generation] Starting daily trip generation...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Get today's day of week
      const dayOfWeek = DAY_MAP[today.getDay()];
      
      console.log(`[Trip Generation] Generating trips for ${dayOfWeek} (${today.toDateString()})`);
      
      // Find all active scheduled routes for today
      const scheduledRoutes = await prisma.scheduledRoute.findMany({
        where: {
          status: ScheduleStatus.ACTIVE,
          recurringDays: {
            has: dayOfWeek,
          },
          OR: [
            { effectiveFrom: null },
            { effectiveFrom: { lte: today } },
          ],
          AND: [
            {
              OR: [
                { effectiveUntil: null },
                { effectiveUntil: { gte: today } },
              ],
            },
          ],
        },
        include: {
          route: {
            include: {
              children: {
                where: {
                  isClaimed: true, // Only generate for claimed children
                },
              },
            },
          },
          bus: true,
          driver: {
            include: {
              user: true, // Include user for driver name logging
            },
          },
        },
      });
      
      console.log(`[Trip Generation] Found ${scheduledRoutes.length} scheduled routes for today`);
      
      const createdTrips = [];
      
      for (const scheduledRoute of scheduledRoutes) {
        // Validate schedule has required assignments
        if (!scheduledRoute.driverId) {
          console.error(`[Trip Generation] Skipping route ${scheduledRoute.route.name}: No driver assigned to schedule`);
          continue;
        }

        if (!scheduledRoute.busId) {
          console.error(`[Trip Generation] Skipping route ${scheduledRoute.route.name}: No bus assigned to schedule`);
          continue;
        }

        // Check if trip already exists for today
        const existingTrip = await prisma.trip.findFirst({
          where: {
            routeId: scheduledRoute.routeId,
            createdAt: {
              gte: today,
              lt: tomorrow,
            },
          },
        });
        
        if (existingTrip) {
          console.log(`[Trip Generation] Trip already exists for route ${scheduledRoute.route.name}`);
          continue;
        }
        
        console.log(`[Trip Generation] Creating trip for route ${scheduledRoute.route.name} - Driver: ${scheduledRoute.driver.user.firstName} ${scheduledRoute.driver.user.lastName}, Bus: ${scheduledRoute.bus.plateNumber}`);

        // Create trip
        const trip = await prisma.trip.create({
          data: {
            routeId: scheduledRoute.routeId,
            busId: scheduledRoute.busId,
            driverId: scheduledRoute.driverId,
            status: 'SCHEDULED',
          },
        });
        
        console.log(`[Trip Generation] ✓ Created trip ${trip.id} for route ${scheduledRoute.route.name} - Driver: ${scheduledRoute.driverId}`);
        
        // Create attendance records for all children on this route (only claimed children)
        if (scheduledRoute.autoAssignChildren && scheduledRoute.route.children.length > 0) {
          const attendances = await prisma.$transaction(
            scheduledRoute.route.children.map((child) =>
              prisma.childAttendance.create({
                data: {
                  childId: child.id,
                  tripId: trip.id,
                  status: 'PENDING',
                  recordedBy: 'SYSTEM',
                },
              })
            )
          );
          
          console.log(`[Trip Generation] Created ${attendances.length} attendance records for trip ${trip.id}`);
        }
        
        createdTrips.push(trip);
      }
      
      console.log(`[Trip Generation] Successfully created ${createdTrips.length} trips for ${dayOfWeek}`);
      
      return {
        success: true,
        date: today.toISOString(),
        dayOfWeek,
        tripsCreated: createdTrips.length,
        trips: createdTrips.map(t => ({ id: t.id, routeId: t.routeId })),
      };
    } catch (error) {
      console.error('[Trip Generation] Error generating trips:', error);
      throw error;
    }
  }
}
