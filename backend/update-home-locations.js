const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateHomeLocations() {
  try {
    const children = await prisma.child.findMany({ take: 10 });
    
    console.log('Updating home locations for', children.length, 'children...\n');
    
    // Accra, Ghana coordinates with slight variations
    const baseLatitude = 5.603717;
    const baseLongitude = -0.186964;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const offset = i * 0.01; // Spread them out on the map
      
      await prisma.child.update({
        where: { id: child.id },
        data: {
          homeLatitude: baseLatitude + offset,
          homeLongitude: baseLongitude + offset
        }
      });
      
      console.log(`✓ Updated ${child.firstName} ${child.lastName}: ${baseLatitude + offset}, ${baseLongitude + offset}`);
    }
    
    console.log('\n✅ All children now have home locations!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateHomeLocations();
