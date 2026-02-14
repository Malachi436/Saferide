const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      schoolId: true,
      passwordHash: true
    }
  });
  
  console.log('Driver users:', JSON.stringify(drivers, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
