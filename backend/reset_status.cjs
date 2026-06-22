const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const data = await prisma.onboarding.findMany({ 
    select: { id: true, status: true, pendaftaran: { select: { user: { select: { nama: true } } } } } 
  });
  console.log(JSON.stringify(data, null, 2));

  // Reset ALL to CHECKLIST_IN_PROGRESS to make it easy for testing
  const res = await prisma.onboarding.updateMany({
    data: { status: 'CHECKLIST_IN_PROGRESS' }
  });
  console.log('Reset all status to CHECKLIST_IN_PROGRESS. Count:', res.count);
}

check().catch(console.error).finally(() => prisma.$disconnect());
