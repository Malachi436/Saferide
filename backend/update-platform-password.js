const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function updatePlatformAdminPassword() {
  try {
    const password = 'Test@1234';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('Updating platform admin password...');
    
    const updated = await prisma.user.update({
      where: { email: 'platform@saferide.com' },
      data: { passwordHash }
    });
    
    console.log('✓ Password updated for:', updated.email);
    console.log('New hash:', passwordHash.substring(0, 20) + '...');
    
    // Verify it works
    const verify = await bcrypt.compare(password, passwordHash);
    console.log('Verification test:', verify ? '✓ Password matches' : '✗ Password does not match');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePlatformAdminPassword();
