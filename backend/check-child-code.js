const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCode() {
  try {
    const code = process.argv[2] || 'TSC-33b9';
    console.log('Checking code:', code);
    
    const child = await prisma.child.findUnique({
      where: { uniqueCode: code },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        uniqueCode: true,
        isClaimed: true,
        parentId: true,
      }
    });
    
    if (child) {
      console.log('\n✅ Child found:');
      console.log(JSON.stringify(child, null, 2));
    } else {
      console.log('\n❌ No child found with code:', code);
      
      // Search for similar codes
      const allChildren = await prisma.child.findMany({
        select: {
          id: true,
          firstName: true,
          lastName: true,
          uniqueCode: true,
          isClaimed: true,
        },
        take: 10,
      });
      
      console.log('\nAll children in database:');
      console.log(JSON.stringify(allChildren, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCode();
