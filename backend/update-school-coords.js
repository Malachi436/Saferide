const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const schools = await prisma.school.findMany({
    where: { companyId: 'd5148423-2f6c-4613-a287-f9a4aedb2170' }
  });
  
  for (const school of schools) {
    await prisma.school.update({
      where: { id: school.id },
      data: {
        latitude: 5.603717,
        longitude: -0.186964,
        address: school.address || 'Accra, Ghana'
      }
    });
    console.log(`✅ Updated ${school.name} with coordinates`);
  }
  
  console.log('\n✅ All schools now have coordinates!');
  await prisma.$disconnect();
})();
