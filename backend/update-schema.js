const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMedicalConditionsColumn() {
  try {
    console.log('Adding medicalConditions column to Child table...');
    
    await prisma.$executeRaw`
      ALTER TABLE "Child" 
      ADD COLUMN IF NOT EXISTS "medicalConditions" TEXT;
    `;
    
    console.log('✅ medicalConditions column added successfully');
    
    // Regenerate unique codes with school prefix
    const children = await prisma.child.findMany({
      include: { school: true },
      where: {
        OR: [
          { uniqueCode: null },
          { uniqueCode: { startsWith: 'ROS' } }
        ]
      }
    });
    
    console.log(`\nUpdating ${children.length} child codes with school prefix...`);
    
    for (const child of children) {
      const schoolCode = child.school.schoolCode || 'ROS';
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWYZ0123456789';
      let code;
      let exists = true;
      
      while (exists) {
        let randomPart = '';
        for (let i = 0; i < 6; i++) {
          randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        code = `${schoolCode}-${randomPart}`;
        
        const existing = await prisma.child.findUnique({
          where: { uniqueCode: code }
        });
        exists = !!existing;
      }
      
      await prisma.child.update({
        where: { id: child.id },
        data: { uniqueCode: code }
      });
      
      console.log(`Updated ${child.firstName} ${child.lastName}: ${code}`);
    }
    
    console.log('\n✅ All updates completed');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addMedicalConditionsColumn();
