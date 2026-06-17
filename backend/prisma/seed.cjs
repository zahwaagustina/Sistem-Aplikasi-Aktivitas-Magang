const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { username: 'super.admin' },
    update: {},
    create: {
      username: 'super.admin',
      password: hashedPassword,
      nama: 'Super Administrator',
      role: 'SUPER_ADMIN',
      email: 'admin@magang.local',
    },
  });

  console.log(`Created super admin: ${superAdmin.username}`);
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
