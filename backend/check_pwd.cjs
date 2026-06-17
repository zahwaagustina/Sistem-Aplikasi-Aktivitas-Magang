const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findFirst({ where: { username: 'hr_admin' } });
  if (!user) {
    console.log("User not found!");
    return;
  }
  const valid = await bcrypt.compare('password123', user.password);
  console.log("Password valid:", valid);
  console.log("User role:", user.role);
}

check().finally(() => prisma.$disconnect());
