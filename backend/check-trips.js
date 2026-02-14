const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all scheduled routes
  const scheduledRoutes = await prisma.scheduledRoute.findMany({
    include: {
      route: true,
      driver: {
        include: { user: true }
      },
      bus: true
    }
  });
  
  console.log('=== SCHEDULED ROUTES ===');
  console.log(JSON.stringify(scheduledRoutes, (key, value) => {
    if (key === 'passwordHash') return '***';
    return value;
  }, 2));

  // Get all trips for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const trips = await prisma.trip.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow
      }
    },
    include: {
      route: true,
      driver: {
        include: { user: true }
      },
      bus: true
    }
  });

  console.log('\n=== TRIPS FOR TODAY ===');
  console.log(JSON.stringify(trips, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
