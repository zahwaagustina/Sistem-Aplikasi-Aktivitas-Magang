const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const totalMagang = await prisma.user.count({ where: { role: 'MAGANG' } });
    console.log('Total Magang:', totalMagang);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const awa = await prisma.user.findUnique({ where: { username: 'awa.magang' } });
    console.log('awa.magang tanggal_selesai:', awa.tanggal_selesai);
    console.log('All tests passed.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
test();
