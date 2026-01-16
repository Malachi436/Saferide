const { PrismaClient } = require('@prisma/client');
const redis = require('ioredis');

const prisma = new PrismaClient();
const redisClient = new redis();

(async () => {
  console.log('=== GPS TRACKING SYSTEM DIAGNOSTIC ===\n');
  
  // 1. Redis Check
  try {
    const pong = await redisClient.ping();
    console.log('✅ Redis:', pong);
  } catch (e) {
    console.log('❌ Redis Error:', e.message);
  }
  
  // 2. Children with coordinates
  const childrenWithCoords = await prisma.child.count({
    where: {
      homeLatitude: { not: null },
      homeLongitude: { not: null }
    }
  });
  const totalChildren = await prisma.child.count();
  console.log(`✅ Children with coordinates: ${childrenWithCoords}/${totalChildren}`);
  
  // 3. Active trips
  const activeTrips = await prisma.trip.count({
    where: { status: 'IN_PROGRESS' }
  });
  console.log(`✅ Active trips (IN_PROGRESS): ${activeTrips}`);
  
  // 4. Get trip details
  const trip = await prisma.trip.findFirst({
    where: { status: 'IN_PROGRESS' },
    include: {
      bus: true,
      driver: { include: { user: true } },
      route: { include: { school: true } }
    }
  });
  
  if (trip) {
    console.log('\n--- Active Trip Details ---');
    console.log('Trip ID:', trip.id);
    console.log('Bus:', trip.bus.plateNumber, '(', trip.bus.id, ')');
    console.log('Driver:', trip.driver?.user ? `${trip.driver.user.firstName} ${trip.driver.user.lastName}` : 'No driver');
    console.log('School:', trip.route.school.name);
    console.log('Route:', trip.route.name);
    
    // Check Redis for bus location
    const busLocation = await redisClient.get(`bus:${trip.bus.id}:location`);
    if (busLocation) {
      const loc = JSON.parse(busLocation);
      console.log(`✅ Bus location in Redis: ${loc.latitude}, ${loc.longitude}`);
    } else {
      console.log('⚠️  No GPS data in Redis yet');
    }
  }
  
  // 5. Check bus assignments
  const buses = await prisma.bus.findMany({
    where: { companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170' },
    include: { driver: { include: { user: true } } }
  });
  console.log(`\n✅ Buses in company: ${buses.length}`);
  buses.forEach(bus => {
    const driverName = bus.driver?.user ? `${bus.driver.user.firstName} ${bus.driver.user.lastName}` : 'No driver';
    console.log(`  - ${bus.plateNumber}: ${driverName}`);
  });
  
  // 6. Check schools
  const schools = await prisma.school.count({
    where: { 
      companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170',
      latitude: { not: null }
    }
  });
  console.log(`\n✅ Schools with coordinates: ${schools}`);
  
  console.log('\n=== DIAGNOSTIC COMPLETE ===');
  
  await prisma.$disconnect();
  redisClient.disconnect();
})();
