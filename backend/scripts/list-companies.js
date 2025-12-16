const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listCompanies() {
  try {
    console.log('\n📋 Fetching all companies from database...\n');
    
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            schools: true,
            users: true,
            buses: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (companies.length === 0) {
      console.log('❌ No companies found in the database.\n');
      return;
    }

    console.log(`✅ Found ${companies.length} company(ies):\n`);
    console.log('='.repeat(80));
    
    companies.forEach((company, index) => {
      console.log(`\n${index + 1}. Company Name: ${company.name}`);
      console.log(`   Company ID: ${company.id}`);
      console.log(`   Contact Email: ${company.contactEmail || 'N/A'}`);
      console.log(`   Contact Phone: ${company.contactPhone || 'N/A'}`);
      console.log(`   Address: ${company.address || 'N/A'}`);
      console.log(`   Created: ${company.createdAt.toLocaleDateString()}`);
      console.log(`   Stats:`);
      console.log(`     - Schools: ${company._count.schools}`);
      console.log(`     - Users: ${company._count.users}`);
      console.log(`     - Buses: ${company._count.buses}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log(`\nTotal Companies: ${companies.length}\n`);

  } catch (error) {
    console.error('❌ Error fetching companies:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listCompanies();
