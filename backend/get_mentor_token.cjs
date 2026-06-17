const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mentor = await prisma.user.findUnique({ where: { username: 'mentor1' } });
  const token = jwt.sign(
    { id: mentor.id, username: mentor.username, role: mentor.role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '1d' }
  );
  console.log(token);
}

main().finally(() => prisma.$disconnect());
