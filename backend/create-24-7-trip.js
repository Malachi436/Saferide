const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create247Trip() {
  try {
    // Get existing data
    const school = await prisma.school.findFirst({ include: { company: true } });
    const bus = await prisma.bus.findFirst();
    const driver = await prisma.driver.findFirst();
    const children = await prisma.child.findMany({ take: 3 });

    if (!school || !bus || !driver) {
      console.error('Missing required data: school, bus, or driver');
      return;
    }

    console.log('Using:');
    console.log('- School:', school.name, school.id);
    console.log('- Bus:', bus.plateNumber, bus.id);
    console.log('- Driver ID:', driver.id);
    console.log('- Children:', children.length);

    // Create or get existing 24/7 route
    let route = await prisma.route.findFirst({
      where: {
        schoolId: school.id,
        name: '24/7 Test Route'
      }
    });

    if (!route) {
      route = await prisma.route.create({
        data: {
          name: '24/7 Test Route',
          schoolId: school.id,
          busId: bus.id,
          shift: 'MORNING'
        }
      });
      console.log('✓ Created route:', route.id);
    } else {
      console.log('✓ Using existing route:', route.id);
    }

    // Create IN_PROGRESS trip (active)
    const trip = await prisma.trip.create({
      data: {
        busId: bus.id,
        routeId: route.id,
        driverId: driver.id,
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });
    console.log('✓ Created 24/7 active trip:', trip.id);

    // Add children with attendance
    if (children.length > 0) {
      for (const child of children) {
        try {
          await prisma.tripAttendance.create({
            data: {
              tripId: trip.id,
              childId: child.id,
              status: 'PICKED_UP',
              pickupTime: new Date()
            }
          });
          console.log('✓ Added child to trip:', child.firstName, child.lastName);
        } catch (err) {
          console.log('⚠ Could not add child (may already exist):', child.firstName);
        }
      }
    }

    console.log('\n✅ 24/7 Trip created successfully!');
    console.log('Trip ID:', trip.id);
    console.log('Status: IN_PROGRESS (active)');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create247Trip();
