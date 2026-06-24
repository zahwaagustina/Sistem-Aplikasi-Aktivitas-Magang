import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const initAbsensiCron = () => {
  // Menjalankan cron job setiap hari Senin sampai Jumat pada pukul 23:55
  cron.schedule('55 23 * * 1-5', async () => {
    console.log('[CRON] Menjalankan pengecekan absensi harian (ALPA)...');
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      // Set to today's midnight in UTC format so it matches standard comparison
      const today = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

      // Dapatkan semua profil magang yang statusnya AKTIF
      const activeMagang = await prisma.profilMagang.findMany({
        where: {
          status: 'AKTIF'
        },
        select: {
          user_id: true
        }
      });

      let alpaCount = 0;

      for (const magang of activeMagang) {
        // Cek apakah peserta magang sudah melakukan absen (hadir/izin/sakit) hari ini
        const existingAbsen = await prisma.absensi.findFirst({
          where: {
            user_id: magang.user_id,
            tanggal: today
          }
        });

        // Jika tidak ditemukan absensi apapun, buat record ALPA
        if (!existingAbsen) {
          await prisma.absensi.create({
            data: {
              user_id: magang.user_id,
              tanggal: today,
              status: 'ALPA',
              keterangan: 'Otomatis oleh sistem (Tanpa Keterangan)'
            }
          });
          alpaCount++;
        }
      }

      console.log(`[CRON] Pengecekan selesai. ${alpaCount} record absensi ALPA ditambahkan.`);
    } catch (error) {
      console.error('[CRON] Terjadi error saat menjalankan cron job absensi:', error);
    }
  });
  
  console.log('[CRON] Jadwal pengecekan absensi harian berhasil diinisialisasi.');
};
