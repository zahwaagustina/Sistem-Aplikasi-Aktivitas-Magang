const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.profilMagang.findMany({ include: { user: true } }).then(d => {
  console.table(d.map(x => ({ 
    user: x.user.username, 
    nama: x.user.nama,
    role: x.user.role,
    mentor_id: x.mentor_id, 
    status: x.status 
  })));
  prisma.$disconnect();
});
