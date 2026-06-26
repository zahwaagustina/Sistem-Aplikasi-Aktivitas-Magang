const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const newPassword = 'password123';

  // Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    console.log(`User dengan email ${email} tidak ditemukan.`);
    return;
  }

  // Hash password baru
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password di database
  await prisma.user.update({
    where: { email: email },
    data: { password: hashedPassword },
  });

  console.log(`Berhasil mereset password untuk user ${user.username} (${email}). Password baru: ${newPassword}`);
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
