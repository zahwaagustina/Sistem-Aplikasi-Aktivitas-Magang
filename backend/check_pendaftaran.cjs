const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.pendaftaran.findMany({ include: { user: true } }).then(res => {
  console.log(res);
  prisma.$disconnect();
});
