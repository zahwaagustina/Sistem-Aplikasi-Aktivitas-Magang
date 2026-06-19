import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const notif = await prisma.notifikasi.findMany();
  console.log(notif);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
