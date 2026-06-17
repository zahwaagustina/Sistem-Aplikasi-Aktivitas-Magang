const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findUnique({ where: { username: 'magang_seed' } }).then(u => {
  console.log(u.id);
  prisma.$disconnect();
});
