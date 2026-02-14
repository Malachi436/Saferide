const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('=== Creating Test Users for Saferide ===\n');

    // Get the test school
    const school = await prisma.school.findFirst({
      include: { company: true }
    });

    if (!school) {
      console.log('✗ No schools found. Please seed the database first.');
      return;
    }

    console.log('School:', school.name, '(ID:', school.id + ')');
    console.log('Company:', school.company?.name, '(ID:', school.company?.id + ')\n');

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Platform Admin
    console.log('1. Creating PLATFORM_ADMIN...');
    let platformAdmin = await prisma.user.findFirst({
      where: { email: 'platform@saferide.com' }
    });

    if (!platformAdmin) {
      platformAdmin = await prisma.user.create({
        data: {
          email: 'platform@saferide.com',
          passwordHash,
          firstName: 'Platform',
          lastName: 'Admin',
          role: 'PLATFORM_ADMIN',
          companyId: null,
          schoolId: null
        }
      });
      console.log('  ✓ Created: platform@saferide.com / password123');
    } else {
      console.log('  ✓ Already exists: platform@saferide.com');
    }

    // 2. Create Company Admin
    console.log('\n2. Creating COMPANY_ADMIN...');
    let companyAdmin = await prisma.user.findFirst({
      where: { email: 'company@saferide.com' }
    });

    if (!companyAdmin) {
      companyAdmin = await prisma.user.create({
        data: {
          email: 'company@saferide.com',
          passwordHash,
          firstName: 'Company',
          lastName: 'Admin',
          role: 'COMPANY_ADMIN',
          companyId: school.companyId,
          schoolId: null
        }
      });
      console.log('  ✓ Created: company@saferide.com / password123');
    } else {
      console.log('  ✓ Already exists: company@saferide.com');
    }

    // 3. Create School Admin
    console.log('\n3. Creating SCHOOL_ADMIN...');
    let schoolAdmin = await prisma.user.findFirst({
      where: { email: 'school@saferide.com' }
    });

    if (!schoolAdmin) {
      schoolAdmin = await prisma.user.create({
        data: {
          email: 'school@saferide.com',
          passwordHash,
          firstName: 'School',
          lastName: 'Admin',
          role: 'SCHOOL_ADMIN',
          companyId: school.companyId,
          schoolId: school.id
        }
      });
      console.log('  ✓ Created: school@saferide.com / password123');
    } else {
      console.log('  ✓ Already exists: school@saferide.com');
    }

    // 4. Create Driver
    console.log('\n4. Creating DRIVER...');
    let driverUser = await prisma.user.findFirst({
      where: { email: 'driver@saferide.com' }
    });

    let driver;
    if (!driverUser) {
      driverUser = await prisma.user.create({
        data: {
          email: 'driver@saferide.com',
          passwordHash,
          firstName: 'John',
          lastName: 'Driver',
          role: 'DRIVER',
          companyId: school.companyId,
          schoolId: school.id
        }
      });

      driver = await prisma.driver.create({
        data: {
          license: 'DL-123456',
          userId: driverUser.id
        }
      });
      console.log('  ✓ Created: driver@saferide.com / password123');
      console.log('  ✓ Driver ID:', driver.id);
    } else {
      driver = await prisma.driver.findFirst({
        where: { userId: driverUser.id }
      });
      console.log('  ✓ Already exists: driver@saferide.com');
    }

    // 5. Create Parent
    console.log('\n5. Creating PARENT...');
    let parentUser = await prisma.user.findFirst({
      where: { email: 'parent@saferide.com' }
    });

    if (!parentUser) {
      parentUser = await prisma.user.create({
        data: {
          email: 'parent@saferide.com',
          passwordHash,
          firstName: 'Jane',
          lastName: 'Parent',
          role: 'PARENT',
          phone: '+233 20 123 4567'
        }
      });

      // Create a child linked to this parent
      const child = await prisma.child.create({
        data: {
          firstName: 'Tommy',
          lastName: 'Student',
          dateOfBirth: new Date('2015-01-01'),
          grade: 'Grade 3',
          schoolId: school.id,
          parentId: parentUser.id,
          parentPhone: '+233 20 123 4567',
          uniqueCode: 'TEST001',
          isClaimed: true,
          pickupType: 'HOME',
          pickupLatitude: 5.5600,
          pickupLongitude: -0.2000
        }
      });

      console.log('  ✓ Created: parent@saferide.com / password123');
      console.log('  ✓ Created child: Tommy Student');
      console.log('  ✓ Child ID:', child.id);
    } else {
      console.log('  ✓ Already exists: parent@saferide.com');
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('=== TEST CREDENTIALS SUMMARY ===');
    console.log('='.repeat(50));
    console.log('\nAll users use password: password123\n');
    console.log('PLATFORM_ADMIN:');
    console.log('  Email: platform@saferide.com');
    console.log('  Access: All schools and companies\n');
    console.log('COMPANY_ADMIN:');
    console.log('  Email: company@saferide.com');
    console.log('  Access: All schools under', school.company?.name, '\n');
    console.log('SCHOOL_ADMIN:');
    console.log('  Email: school@saferide.com');
    console.log('  Access:', school.name, '\n');
    console.log('DRIVER:');
    console.log('  Email: driver@saferide.com');
    console.log('  School:', school.name, '\n');
    console.log('PARENT:');
    console.log('  Email: parent@saferide.com');
    console.log('  Child: Tommy Student\n');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('✗ Failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();