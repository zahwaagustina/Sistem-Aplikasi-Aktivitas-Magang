import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mentors = await prisma.user.findMany({ where: { role: 'MENTOR' } });
  const profil = await prisma.profilMagang.findMany();
  
  console.log('Mentors:', mentors.map(m => ({ id: m.id, nama: m.nama })));
  console.log('ProfilMagang mentor_ids:', profil.map(p => ({ user_id: p.user_id, mentor_id: p.mentor_id })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
