const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const n = await prisma.notifikasi.findMany({ where: { user_id: 8 } });
  console.log(n.map(x => ({ judul: x.judul, link: x.link })));
  await prisma.$disconnect();
}
check();
