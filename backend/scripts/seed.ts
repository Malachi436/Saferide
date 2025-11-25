import { PrismaClient } from '@prisma/client';
import { PrismaPg as PrismaPostgreSQL } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';

const adapter = new PrismaPostgreSQL(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create platform admin
  const platformAdminPassword = await hash('admin123', 10);
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'admin@rosago.com',
      passwordHash: platformAdminPassword,
      firstName: 'Platform',
      lastName: 'Administrator',
      role: 'PLATFORM_ADMIN',
    },
  });

  // Create a sample company
  const company = await prisma.company.create({
    data: {
      name: 'Greenwood School District',
      email: 'info@greenwood.edu',
      phone: '+1234567890',
      address: '123 Education St, Learning City',
    },
  });

  // Create a school
  const school = await prisma.school.create({
    data: {
      name: 'Greenwood Elementary',
      companyId: company.id,
    },
  });

  // Create company admin
  const companyAdminPassword = await hash('company123', 10);
  const companyAdmin = await prisma.user.create({
    data: {
      email: 'principal@greenwood.edu',
      passwordHash: companyAdminPassword,
      firstName: 'Jane',
      lastName: 'Principal',
      role: 'COMPANY_ADMIN',
      companyId: company.id,
      schoolId: school.id,
    },
  });

  // Create a driver
  const driverPassword = await hash('driver123', 10);
  const driverUser = await prisma.user.create({
    data: {
      email: 'driver1@greenwood.edu',
      passwordHash: driverPassword,
      firstName: 'John',
      lastName: 'Driver',
      role: 'DRIVER',
      companyId: company.id,
      schoolId: school.id,
    },
  });

  const driver = await prisma.driver.create({
    data: {
      license: 'DL123456789',
      userId: driverUser.id,
    },
  });

  // Create a parent
  const parentPassword = await hash('parent123', 10);
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent1@example.com',
      passwordHash: parentPassword,
      firstName: 'Parent',
      lastName: 'One',
      role: 'PARENT',
      companyId: company.id,
      schoolId: school.id,
    },
  });

  // Create a child
  const child = await prisma.child.create({
    data: {
      firstName: 'Alice',
      lastName: 'Student',
      dateOfBirth: new Date('2015-05-15'),
      parentId: parentUser.id,
      schoolId: school.id,
    },
  });

  // Create a bus
  const bus = await prisma.bus.create({
    data: {
      plateNumber: 'BUS123',
      capacity: 40,
      driverId: driver.id,
    },
  });

  // Create a route
  const route = await prisma.route.create({
    data: {
      name: 'Morning Route A',
      schoolId: school.id,
    },
  });

  // Create stops
  const stop1 = await prisma.stop.create({
    data: {
      name: 'Stop 1 - Main Street',
      latitude: 0.347596,
      longitude: 32.582520,
      order: 1,
      routeId: route.id,
    },
  });

  const stop2 = await prisma.stop.create({
    data: {
      name: 'Stop 2 - Oak Avenue',
      latitude: 0.348596,
      longitude: 32.583520,
      order: 2,
      routeId: route.id,
    },
  });

  const stop3 = await prisma.stop.create({
    data: {
      name: 'Stop 3 - School',
      latitude: 0.349596,
      longitude: 32.584520,
      order: 3,
      routeId: route.id,
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Created users:');
  console.log(`- Platform Admin: ${platformAdmin.email} (password: admin123)`);
  console.log(`- Company Admin: ${companyAdmin.email} (password: company123)`);
  console.log(`- Driver: ${driverUser.email} (password: driver123)`);
  console.log(`- Parent: ${parentUser.email} (password: parent123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });