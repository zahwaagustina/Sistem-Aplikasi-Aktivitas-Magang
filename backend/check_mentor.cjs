const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.profilMagang.findMany({ include: { user: true } }).then(res => {
  console.log(res);
  prisma.$disconnect();
});
