const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all scheduled routes
  const routes = await prisma.scheduledRoute.findMany({
    include: { route: { include: { bus: { include: { driver: true } } } } } }
  });

  console.log('=== FIXING SCHEDULED ROUTES ===');

  for (const s of routes) {
    const routeDriverId = s.route.bus?.driver?.id;
    const routeBusId = s.route.busId || s.route.bus?.id;

    console.log(`Route: ${s.route.name}`);
    console.log(`  Before - driverId: ${s.driverId}, busId: ${s.busId}`);
    console.log(`  From route - driverId: ${routeDriverId}, busId: ${routeBusId}`);

    if ((!s.driverId && routeDriverId) || (!s.busId && routeBusId)) {
      await prisma.scheduledRoute.update({
        where: { id: s.id },
        data: { driverId: s.driverId || routeDriverId, busId: s.busId || routeBusId }
      });
      console.log('  -> UPDATED');
    } else {
      console.log('  -> OK or no data to update');
    }
  }

  console.log('\n=== GENERATING TRIPS ===');
  
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const dayMap = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const dayOfWeek = dayMap[today.getDay()];
  
  console.log(`Today: ${dayOfWeek}`);

  const schedules = await prisma.scheduledRoute.findMany({
    where: { 
      status: 'ACTIVE', 
      recurringDays: { has: dayOfWeek }, 
      OR: [{ effectiveFrom: null }, { effectiveFrom: { lte: today } }], 
      AND: [{ OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: today } }] }] 
    },
    include: { route: true, bus: true, driver: { include: { user: true } } }
  });

  console.log(`Found ${schedules.length} active schedules`);

  let created = 0;
  for (const s of schedules) {
    if (!s.driverId || !s.busId) { console.log(`Skip ${s.route.name}: no driver/bus`); continue; }
    
    const exists = await prisma.trip.findFirst({ where: { routeId: s.routeId, createdAt: { gte: today, lt: tomorrow } } });
    if (exists) { console.log(`Skip ${s.route.name}: trip exists`); continue; }
    
    const [h, m] = s.scheduledTime.split(':');
    const st = new Date(today); st.setHours(parseInt(h), parseInt(m), 0, 0);
    
    await prisma.trip.create({ data: { routeId: s.routeId, driverId: s.driverId, busId: s.busId, status: 'SCHEDULED', startTime: st, scheduledDate: today } });
    console.log(`Created trip for ${s.route.name} at ${s.scheduledTime}`);
    created++;
  }

  console.log(`\nTotal created: ${created}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
