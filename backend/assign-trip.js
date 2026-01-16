const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const driver = await prisma.driver.findFirst({ 
    where: { userId: 'ea03300a-a40a-4bd7-849a-c5d43d0f0415' } 
  });
  
  const trip = await prisma.trip.findFirst({ 
    where: { status: 'IN_PROGRESS' }, 
    orderBy: { createdAt: 'desc' } 
  });
  
  if (trip && driver) {
    await prisma.trip.update({ 
      where: { id: trip.id }, 
      data: { driverId: driver.id } 
    });
    console.log('✅ Trip', trip.id, 'assigned to driver', driver.id);
  } else {
    console.log('❌ No active trip or driver found');
  }
  
  await prisma.$disconnect();
})();
