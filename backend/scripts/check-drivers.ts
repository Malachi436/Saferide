import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking drivers in database...');
  
  // Get all drivers
  const drivers = await prisma.driver.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          schoolId: true,
          email: true,
        }
      }
    }
  });
  
  console.log('Total drivers in database:', drivers.length);
  drivers.forEach(d => {
    console.log(`- Driver: ${d.user?.firstName} ${d.user?.lastName} (${d.user?.email})`);
    console.log(`  License: ${d.license}`);
    console.log(`  SchoolId: ${d.user?.schoolId || 'NULL'}`);
  });

  // Get all schools
  const schools = await prisma.school.findMany();
  console.log('\nSchools in database:');
  schools.forEach(s => console.log(`- ${s.name} (${s.id})`));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
