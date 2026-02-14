const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Kwame's driver record
  const kwameUser = await prisma.user.findFirst({
    where: { email: 'kwame@gmail.com' }
  });
  
  if (!kwameUser) {
    console.error('Kwame user not found!');
    return;
  }
  
  console.log('Found Kwame user:', kwameUser.id, kwameUser.firstName, kwameUser.lastName);
  
  const driver = await prisma.driver.findFirst({
    where: { userId: kwameUser.id }
  });
  
  if (!driver) {
    console.error('Kwame driver record not found!');
    return;
  }
  
  console.log('Found driver:', driver.id);
  
  // Get Kwame's school
  const school = await prisma.school.findFirst({
    where: { id: kwameUser.schoolId }
  });
  
  console.log('School:', school?.name, school?.id);
  
  // Get or create a bus for the school
  let bus = await prisma.bus.findFirst({
    where: { schoolId: school.id }
  });
  
  if (!bus) {
    bus = await prisma.bus.create({
      data: {
        plateNumber: 'KW-2024-001',
        capacity: 30,
        schoolId: school.id,
        driverId: driver.id
      }
    });
    console.log('Created bus:', bus.id);
  } else {
    console.log('Found bus:', bus.id, bus.plateNumber);
  }
  
  // Update bus with driver
  bus = await prisma.bus.update({
    where: { id: bus.id },
    data: { driverId: driver.id }
  });
  
  // Create or find a 24/7 test route
  let route = await prisma.route.findFirst({
    where: { 
      schoolId: school.id,
      name: '24/7 Kwame Test Route'
    }
  });
  
  if (!route) {
    route = await prisma.route.create({
      data: {
        name: '24/7 Kwame Test Route',
        schoolId: school.id,
        busId: bus.id,
        shift: 'MORNING'
      }
    });
    console.log('Created route:', route.id);
  } else {
    // Update route with bus
    route = await prisma.route.update({
      where: { id: route.id },
      data: { busId: bus.id }
    });
    console.log('Using existing route:', route.id);
  }
  
  // Create 24/7 scheduled route
  let scheduledRoute = await prisma.scheduledRoute.findFirst({
    where: {
      routeId: route.id,
      status: 'ACTIVE'
    }
  });
  
  if (!scheduledRoute) {
    scheduledRoute = await prisma.scheduledRoute.create({
      data: {
        routeId: route.id,
        driverId: driver.id,
        busId: bus.id,
        scheduledTime: '00:00',
        recurringDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
        status: 'ACTIVE',
        autoAssignChildren: false
      }
    });
    console.log('Created scheduled route:', scheduledRoute.id);
  }
  
  // Create IN_PROGRESS trip
  const existingTrip = await prisma.trip.findFirst({
    where: {
      driverId: driver.id,
      status: 'IN_PROGRESS'
    }
  });
  
  if (existingTrip) {
    console.log('IN_PROGRESS trip already exists:', existingTrip.id);
  } else {
    const trip = await prisma.trip.create({
      data: {
        busId: bus.id,
        routeId: route.id,
        driverId: driver.id,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        scheduledDate: new Date()
      }
    });
    console.log('Created IN_PROGRESS trip:', trip.id);
    
    // Add children with attendance
    const children = await prisma.child.findMany({
      where: { schoolId: school.id, isClaimed: true },
      take: 2
    });
    
    console.log(`Found ${children.length} claimed children`);
    
    for (const child of children) {
      try {
        await prisma.childAttendance.create({
          data: {
            childId: child.id,
            tripId: trip.id,
            status: 'PICKED_UP',
            pickupTime: new Date()
          }
        });
        console.log(`Added child to trip: ${child.firstName} ${child.lastName}`);
      } catch (err) {
        console.log(`Could not add child (may exist): ${child.firstName}`);
      }
    }
  }
  
  console.log('\n=== 24/7 Trip for Kwame created successfully! ===');
  console.log('Driver: Kwame Akoto');
  console.log('Bus:', bus.plateNumber);
  console.log('Route: 24/7 Kwame Test Route');
  console.log('Status: IN_PROGRESS');
  
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
