const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkPlatformAdmin() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'platform@saferide.com' }
    });
    
    if (!user) {
      console.log('Platform admin not found!');
      return;
    }
    
    console.log('Platform admin found:', user.email);
    console.log('Password hash:', user.passwordHash.substring(0, 20) + '...');
    
    // Test password
    const password = 'Test@1234';
    const matches = await bcrypt.compare(password, user.passwordHash);
    console.log('Password "Test@1234" matches:', matches);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlatformAdmin();
