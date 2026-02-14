import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'admin@saferide.com' },
    select: { id: true, email: true, role: true, schoolId: true }
  });
  
  console.log('Admin User:', JSON.stringify(user, null, 2));
  
  const school = await prisma.school.findFirst({
    where: { name: { contains: 'Greenfield' } }
  });
  
  console.log('School:', JSON.stringify(school, null, 2));
  
  await prisma.$disconnect();
}

main().catch(console.error);
