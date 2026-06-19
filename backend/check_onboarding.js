import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const onboardings = await prisma.onboarding.findMany({
    include: { pendaftaran: { include: { user: true, lowongan: true } } }
  });
  console.log(JSON.stringify(onboardings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
