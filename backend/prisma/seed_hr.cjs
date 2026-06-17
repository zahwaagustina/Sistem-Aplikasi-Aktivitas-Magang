const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { username: 'hr_admin' },
    update: {},
    create: {
      nama: 'HR Admin',
      username: 'hr_admin',
      email: 'hr@example.com',
      password: hashedPassword,
      role: 'HR_ADMIN'
    }
  });

  console.log('HR Admin created: hr_admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
