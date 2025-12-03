import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('Clearing existing data...');
  await prisma.childAttendance.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.scheduledRoute.deleteMany();
  await prisma.child.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.bus.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.company.deleteMany();
  console.log('Database cleared!');

  // Create a company
  const company = await prisma.company.create({
    data: {
      name: 'SafeRide Transport Ltd',
      email: 'admin@saferide.com',
      phone: '+233 20 123 4567',
      address: '123 Main Street, Accra',
    },
  });

  console.log(`Created company: ${company.name}`);

  // Create a school
  const school = await prisma.school.create({
    data: {
      name: 'Greenfield Academy',
      companyId: company.id,
    },
  });

  console.log(`Created school: ${school.name}`);

  // Create a company admin
  const passwordHash = await bcrypt.hash('Test@1234', 10);
  
  // Create a platform admin (global access)
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'platform@saferide.com',
      passwordHash,
      firstName: 'Platform',
      lastName: 'Admin',
      phone: '+233 20 000 0000',
      role: 'PLATFORM_ADMIN',
    },
  });

  console.log(`Created platform admin: ${platformAdmin.email}`);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@saferide.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+233 20 111 1111',
      role: 'COMPANY_ADMIN',
      companyId: company.id,
    },
  });

  console.log(`Created admin user: ${adminUser.email}`);

  // Create a driver
  const driverUser = await prisma.user.create({
    data: {
      email: 'driver@saferide.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Driver',
      phone: '+233 24 222 2222',
      role: 'DRIVER',
      companyId: company.id,
      schoolId: school.id,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      license: 'DL-2024-001',
      userId: driverUser.id,
    },
  });

  console.log(`Created driver: ${driverUser.email}`);

  // Create a bus
  const bus = await prisma.bus.create({
    data: {
      plateNumber: 'GR-2024-001',
      capacity: 30,
      driverId: driver.id,
    },
  });

  console.log(`Created bus: ${bus.plateNumber}`);

  // Create a route with stops
  const route = await prisma.route.create({
    data: {
      name: 'Osu - Greenfield Route',
      schoolId: school.id,
      stops: {
        create: [
          {
            name: 'Oxford Street Stop',
            latitude: 5.5965,
            longitude: -0.175,
            order: 1,
          },
          {
            name: 'Cantonments Road Stop',
            latitude: 5.6015,
            longitude: -0.182,
            order: 2,
          },
          {
            name: 'School Gate',
            latitude: 5.6037,
            longitude: -0.187,
            order: 3,
          },
        ],
      },
    },
  });

  console.log(`Created route: ${route.name}`);

  // Create a parent user
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@test.com',
      passwordHash,
      firstName: 'Ama',
      lastName: 'Mensah',
      phone: '+233 50 555 5555',
      role: 'PARENT',
      companyId: company.id,
    },
  });

  console.log(`Created parent user: ${parentUser.email}`);

  // Create children for the parent
  const child1 = await prisma.child.create({
    data: {
      firstName: 'Akosua',
      lastName: 'Mensah',
      dateOfBirth: new Date('2010-05-15'),
      parentId: parentUser.id,
      schoolId: school.id,
    },
  });

  const child2 = await prisma.child.create({
    data: {
      firstName: 'Kwabena',
      lastName: 'Mensah',
      dateOfBirth: new Date('2012-08-20'),
      parentId: parentUser.id,
      schoolId: school.id,
    },
  });

  console.log(`Created children: ${child1.firstName}, ${child2.firstName}`);

  // Add pickup locations for children
  await prisma.child.update({
    where: { id: child1.id },
    data: {
      pickupType: 'HOME',
      pickupLatitude: 5.5965,
      pickupLongitude: -0.175,
      homeLatitude: 5.5965,
      homeLongitude: -0.175,
      homeAddress: 'Near Oxford Street Stop',
    },
  });

  await prisma.child.update({
    where: { id: child2.id },
    data: {
      pickupType: 'HOME',
      pickupLatitude: 5.6015,
      pickupLongitude: -0.182,
      homeLatitude: 5.6015,
      homeLongitude: -0.182,
      homeAddress: 'Near Cantonments Road Stop',
    },
  });

  console.log('Updated children with pickup locations');

  // Create a scheduled route (recurring Monday-Friday at 7:00 AM)
  const scheduledRoute = await prisma.scheduledRoute.create({
    data: {
      routeId: route.id,
      driverId: driver.id,
      busId: bus.id,
      scheduledTime: '07:00',
      recurringDays: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
      status: 'ACTIVE',
      autoAssignChildren: true,
    },
  });

  console.log(`Created scheduled route: ${scheduledRoute.id}`);

  // Create a trip for today (for immediate testing)
  const today = new Date();
  today.setHours(7, 0, 0, 0); // Set to 7:00 AM today
  const trip = await prisma.trip.create({
    data: {
      busId: bus.id,
      routeId: route.id,
      driverId: driver.id,
      status: 'SCHEDULED',
      startTime: today,
    },
  });

  console.log(`Created trip: ${trip.id}`);

  // Create attendance records
  await prisma.childAttendance.create({
    data: {
      childId: child1.id,
      tripId: trip.id,
      status: 'PICKED_UP',
      recordedBy: driverUser.id,
    },
  });

  await prisma.childAttendance.create({
    data: {
      childId: child2.id,
      tripId: trip.id,
      status: 'PICKED_UP',
      recordedBy: driverUser.id,
    },
  });

  console.log('Database seed completed successfully!');
  console.log('\n=== SUMMARY ===');
  console.log('- Scheduled Route: Every weekday at 7:00 AM');
  console.log('- Children will be auto-assigned to trips based on their pickup locations');
  console.log('- Trips will be auto-generated daily at midnight');
  console.log('- Manual generation: POST /trips/generate-today');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
