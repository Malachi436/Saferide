const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSchoolOwnedBus() {
  try {
    console.log('=== Creating School-Owned Bus ===\n');

    // Get the test school
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('✗ No schools found');
      return;
    }

    console.log('Using school:', school.name);

    // Create a school-owned bus
    const bus = await prisma.bus.create({
      data: {
        plateNumber: 'SCHOOL-001',
        capacity: 40,
        schoolId: school.id
      }
    });

    console.log('✓ Created school-owned bus:');
    console.log('  Plate Number:', bus.plateNumber);
    console.log('  Capacity:', bus.capacity);
    console.log('  School ID:', bus.schoolId);

    // Update school fare to test fare history
    const updatedSchool = await prisma.school.update({
      where: { id: school.id },
      data: { baseFare: 60000 }
    });

    // Create fare history record
    await prisma.fareHistory.create({
      data: {
        schoolId: school.id,
        oldFare: 50000,
        newFare: 60000,
        changedBy: 'system'
      }
    });

    console.log('✓ Updated school fare to:', updatedSchool.baseFare);
    console.log('✓ Created fare history record');

  } catch (error) {
    console.error('✗ Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSchoolOwnedBus();