const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  // Get the company that Kwame Joe has access to
  const targetCompany = await prisma.company.findUnique({
    where: { id: 'd5148423-2f6c-4613-a287-f9a4aedb2170' }
  });
  
  console.log('Target Company:', targetCompany?.name);
  
  // Get or create a school under this company
  let school = await prisma.school.findFirst({
    where: { companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170' }
  });
  
  if (!school) {
    school = await prisma.school.create({
      data: {
        name: 'Main School',
        companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170',
        address: 'Accra, Ghana',
        contactEmail: 'school@example.com',
        contactPhone: '+233123456789'
      }
    });
    console.log('✓ Created school:', school.id);
  } else {
    console.log('✓ Found school:', school.id, school.name);
  }
  
  // Get bus and driver
  const bus = await prisma.bus.findFirst({
    where: { companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170' }
  });
  
  const driver = await prisma.driver.findFirst({
    where: { userId: 'ea03300a-a40a-4bd7-849a-c5d43d0f0415' }
  });
  
  console.log('Bus:', bus?.plateNumber, bus?.id);
  console.log('Driver:', driver?.id);
  
  // Update the existing route to belong to this school
  const route = await prisma.route.updateMany({
    where: { name: '24/7 Test Route' },
    data: { 
      schoolId: school.id,
      busId: bus.id
    }
  });
  
  console.log('✓ Updated route to belong to school:', school.id);
  
  // Update trip to use correct bus and driver
  const trip = await prisma.trip.findFirst({
    where: { status: 'IN_PROGRESS' },
    orderBy: { createdAt: 'desc' }
  });
  
  if (trip && bus && driver) {
    await prisma.trip.update({
      where: { id: trip.id },
      data: {
        busId: bus.id,
        driverId: driver.id
      }
    });
    console.log('✓ Updated trip with correct bus and driver');
  }
  
  // Update children to belong to this school
  const children = await prisma.child.findMany({ take: 3 });
  for (const child of children) {
    await prisma.child.update({
      where: { id: child.id },
      data: { schoolId: school.id }
    });
  }
  console.log('✓ Updated', children.length, 'children to belong to school');
  
  console.log('\n✅ Route and trip now visible in dashboard!');
  console.log('School ID:', school.id);
  console.log('Company ID:', targetCompany.id);
  
  await prisma.$disconnect();
})();
