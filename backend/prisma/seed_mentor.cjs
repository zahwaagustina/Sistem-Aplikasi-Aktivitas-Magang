const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor1@example.com' },
    update: {},
    create: {
      username: 'mentor1',
      email: 'mentor1@example.com',
      password: hashedPassword,
      nama: 'Budi (Mentor IT)',
      role: 'MENTOR',
      no_telepon: '081234567891'
    }
  });

  console.log('Mentor created:', mentor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
