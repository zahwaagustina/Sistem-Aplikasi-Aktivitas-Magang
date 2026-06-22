const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
  const users = await prisma.user.findMany({
    where: { role: 'MENTOR' },
    orderBy: { id: 'desc' },
    take: 5
  });
  console.log(users);
}
checkDb();
