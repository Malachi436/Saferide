import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing drivers without schoolId...');
  
  // Find the "New School" 
  const newSchool = await prisma.school.findFirst({
    where: { name: 'New School' }
  });
  
  if (!newSchool) {
    console.log('New School not found, using Greenfield Academy');
    const school = await prisma.school.findFirst();
    if (!school) {
      console.error('No school found!');
      process.exit(1);
    }
    
    // Update drivers without schoolId
    const result = await prisma.user.updateMany({
      where: { 
        role: 'DRIVER',
        schoolId: null
      },
      data: { schoolId: school.id }
    });
    console.log(`Updated ${result.count} drivers to school: ${school.name} (${school.id})`);
  } else {
    // Update drivers without schoolId to New School
    const result = await prisma.user.updateMany({
      where: { 
        role: 'DRIVER',
        schoolId: null
      },
      data: { schoolId: newSchool.id }
    });
    console.log(`Updated ${result.count} drivers to school: ${newSchool.name} (${newSchool.id})`);
  }

  // Verify the fix
  const drivers = await prisma.driver.findMany({
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          schoolId: true,
        }
      }
    }
  });
  
  console.log('\nDrivers after fix:');
  drivers.forEach(d => {
    console.log(`- ${d.user?.firstName} ${d.user?.lastName} - SchoolId: ${d.user?.schoolId}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
