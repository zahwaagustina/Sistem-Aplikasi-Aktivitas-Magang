const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { in: ['MAGANG', 'MENTOR'] } },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        email: true,
        created_at: true,
        profilMagang: {
          select: {
            universitas: true,
            jurusan: true,
            tanggal_selesai: true,
            id_magang: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    console.log("SUCCESS:");
    console.log(JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
run();
