import prisma from '../utils/prisma.js';
import cron from 'node-cron';
export const initAbsensiCron = () => {
  // 1. Cron job jam 12:01 WIB untuk set ALPA
  cron.schedule('1 12 * * 1-5', async () => {
    console.log('[CRON] Menjalankan pengecekan absensi ALPA (12:01 WIB)...');
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
              keterangan: 'Otomatis oleh sistem (Tidak Check-in hingga 12:00 WIB)'
            }
          });
          alpaCount++;
        }
      }

      console.log(`[CRON] Pengecekan selesai. ${alpaCount} record absensi ALPA ditambahkan.`);
    } catch (error) {
      console.error('[CRON] Terjadi error saat menjalankan cron job ALPA:', error);
    }
  }, {
    timezone: "Asia/Jakarta"
  });

  // 2. Cron job jam 18:01 WIB untuk Auto Check-out
  cron.schedule('1 18 * * 1-5', async () => {
    console.log('[CRON] Menjalankan pengecekan Auto Check-out (18:01 WIB)...');
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

      // Dapatkan semua absensi hari ini yang belum check-out
      const absensiHariIni = await prisma.absensi.findMany({
        where: {
          tanggal: today,
          status: 'HADIR',
          waktu_keluar: null
        }
      });

      let checkoutCount = 0;
      const autoCheckoutTime = new Date(); // Waktu saat cron jalan (~18:01)

      for (const absen of absensiHariIni) {
        await prisma.absensi.update({
          where: { id: absen.id },
          data: {
            waktu_keluar: autoCheckoutTime,
            lokasi_keluar: 'Otomatis oleh sistem'
          }
        });
        checkoutCount++;
      }
      console.log(`[CRON] Pengecekan selesai. ${checkoutCount} record absensi di-check-out secara otomatis.`);
    } catch (error) {
      console.error('[CRON] Terjadi error saat menjalankan cron job Auto Check-out:', error);
    }
  }, {
    timezone: "Asia/Jakarta"
  });
  
  console.log('[CRON] Jadwal pengecekan absensi (ALPA & Auto Check-out) berhasil diinisialisasi.');
};
