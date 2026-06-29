import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initNotifikasiCron = () => {
  // Berjalan setiap hari pada pukul 00:00 (tengah malam)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Cron] Memulai proses pembersihan notifikasi yang sudah kedaluwarsa...');
      const result = await prisma.notifikasi.deleteMany({
        where: {
          expires_at: { lte: new Date() }
        }
      });
      console.log(`[Cron] Berhasil menghapus ${result.count} notifikasi kedaluwarsa.`);
    } catch (error) {
      console.error('[Cron] Gagal membersihkan notifikasi kedaluwarsa:', error);
    }
  });
};
