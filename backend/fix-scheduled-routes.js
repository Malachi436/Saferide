const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all scheduled routes
  const scheduledRoutes = await prisma.scheduledRoute.findMany({
    include: {
      route: {
        include: {
          bus: {
            include: {
              driver: true
            }
          }
        }
      }
    }
  });

  console.log('Checking scheduled routes for missing driver/bus...\n');

  for (const schedule of scheduledRoutes) {
    console.log(`Scheduled Route: ${schedule.id}`);
    console.log(`  Route: ${schedule.route.name}`);
    console.log(`  Current driverId: ${schedule.driverId}`);
    console.log(`  Current busId: ${schedule.busId}`);
    
    // Get driver and bus from route
    const routeDriverId = schedule.route.bus?.driver?.id;
    const routeBusId = schedule.route.busId || schedule.route.bus?.id;
    
    console.log(`  Route busId: ${schedule.route.busId}`);
    console.log(`  Route bus driverId: ${routeDriverId}`);
    
    // Update if needed
    if ((!schedule.driverId && routeDriverId) || (!schedule.busId && routeBusId)) {
      console.log(`  -> UPDATE NEEDED`);
      await prisma.scheduledRoute.update({
        where: { id: schedule.id },
        data: {
          driverId: schedule.driverId || routeDriverId,
          busId: schedule.busId || routeBusId
        }
      });
      console.log(`  -> UPDATED!`);
    } else {
      console.log(`  -> OK (or cannot update - route has no bus)`);
    }
    console.log('');
  }

  // Now generate trips manually
  console.log('\n=== Generating trips for today ===\n');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const dayOfWeek = dayMap[today.getDay()];
  
  console.log(`Today is: ${dayOfWeek} (${today.toDateString()})`);
  
  const activeSchedules = await prisma.scheduledRoute.findMany({
    where: {
      status: 'ACTIVE',
      recurringDays: { has: dayOfWeek },
      OR: [
        { effectiveFrom: null },
        { effectiveFrom: { lte: today } }
      ],
      AND: [
        {
          OR: [
            { effectiveUntil: null },
            { effectiveUntil: { gte: today } }
          ]
        }
      ]
    },
    include: {
      route: true,
      bus: true,
      driver: {
        include: { user: true }
      }
    }
  });
  
  console.log(`Found ${activeSchedules.length} active scheduled routes for today`);
  
  let tripsCreated = 0;
  
  for (const schedule of activeSchedules) {
    console.log(`\nProcessing: ${schedule.route.name}`);
    console.log(`  Driver: ${schedule.driver?.user?.firstName} ${schedule.driver?.user?.lastName}`);
    console.log(`  Bus: ${schedule.bus?.plateNumber}`);
    console.log(`  Time: ${schedule.scheduledTime}`);
    
    if (!schedule.driverId) {
      console.log(`  -> SKIPPED: No driver assigned`);
      continue;
    }
    
    if (!schedule.busId) {
      console.log(`  -> SKIPPED: No bus assigned`);
      continue;
    }
    
    // Check if trip already exists
    const existingTrip = await prisma.trip.findFirst({
      where: {
        routeId: schedule.routeId,
        createdAt: { gte: today, lt: tomorrow }
      }
    });
    
    if (existingTrip) {
      console.log(`  -> SKIPPED: Trip already exists`);
      continue;
    }
    
    // Create trip
    const [hours, minutes] = schedule.scheduledTime.split(':');
    const startTime = new Date(today);
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const trip = await prisma.trip.create({
      data: {
        routeId: schedule.routeId,
        driverId: schedule.driverId,
        busId: schedule.busId,
        status: 'SCHEDULED',
        startTime: startTime,
        scheduledDate: today
      }
    });
    
    console.log(`  -> CREATED TRIP: ${trip.id}`);
    tripsCreated++;
  }
  
  console.log(`\n=== Total trips created: ${tripsCreated} ===`);
  
  await prisma.$disconnect();
}

main().catch(console.error);
