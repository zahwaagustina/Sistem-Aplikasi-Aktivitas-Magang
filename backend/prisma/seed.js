import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password 'password123'
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Upsert to avoid duplication error if seed is run multiple times
  const admin = await prisma.user.upsert({
    where: { username: 'super.admin' },
    update: {},
    create: {
      nama: 'Super Admin',
      username: 'super.admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const pembimbing = await prisma.user.upsert({
    where: { username: 'budi.pembimbing' },
    update: {},
    create: {
      nama: 'Budi Pembimbing',
      username: 'budi.pembimbing',
      password: hashedPassword,
      role: 'PEMBIMBING',
    },
  });

  const magang = await prisma.user.upsert({
    where: { username: 'awa.magang' },
    update: {},
    create: {
      nama: 'Awa',
      username: 'awa.magang',
      password: hashedPassword,
      role: 'MAGANG',
      divisi: 'IT Support',
    },
  });

  console.log('Seeder success:', { admin: admin.nama, pembimbing: pembimbing.nama, magang: magang.nama });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
