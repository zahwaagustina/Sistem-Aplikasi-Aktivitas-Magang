import prisma from './utils/prisma.js';

async function main() {
  try {
    // Find a MAGANG user to test with
    const user = await prisma.user.findFirst({ where: { role: 'MAGANG' } });
    if (!user) {
      console.log('No MAGANG user found');
      return;
    }
    console.log('Testing logbook creation for user:', user.email);

    // Try creating logbook
    const result = await prisma.$transaction(async (tx) => {
      const aktivitas = await tx.aktivitasHarian.create({
        data: {
          user_id: user.id,
          tanggal: new Date(),
          deskripsi_kegiatan: 'test',
          hasil_kegiatan: 'test',
          waktu_mulai: '08:00',
          waktu_selesai: '17:00',
          kendala: 'test',
          status: 'TERKIRIM'
        }
      });
      return aktivitas;
    });

    console.log('Success:', result);
  } catch (err) {
    console.error('Error creating logbook:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
