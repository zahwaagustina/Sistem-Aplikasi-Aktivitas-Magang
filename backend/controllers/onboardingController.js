import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

// 1. Dapatkan status onboarding kandidat saat ini
export const getMyOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: { user_id: userId, status: 'ACCEPTED' },
      include: {
        lowongan: { include: { program: true } },
      }
    });

    if (!pendaftaran) {
      return res.status(404).json({ message: 'Pendaftaran diterima tidak ditemukan.' });
    }

    let onboarding = await prisma.onboarding.findUnique({
      where: { pendaftaran_id: pendaftaran.id },
      include: { checklist: true, mentor: { select: { nama: true, email: true, no_telepon: true } } }
    });

    // Jika admin mengubah status jadi ACCEPTED tapi belum men-trigger onboarding
    if (!onboarding) {
      onboarding = await prisma.onboarding.create({
        data: {
          pendaftaran_id: pendaftaran.id,
          status: 'WAITING_CONFIRMATION',
        },
        include: { checklist: true }
      });
      // Simulasi Notif Email
      await sendEmail(req.user.email, 'Selamat! Anda Diterima Magang', `Halo ${req.user.nama},\n\nSelamat! Anda diterima untuk posisi ${pendaftaran.lowongan.posisi}. Silakan login ke portal untuk memulai proses onboarding dan merespons penawaran kami.\n\nTerima kasih.`);
    }

    // Ambil dokumen user terkait onboarding
    const dokumen = await prisma.dokumen.findMany({
      where: { user_id: userId, tipe: { in: ['KTP', 'NDA', 'PAKTA_INTEGRITAS', 'LOA'] } }
    });

    res.status(200).json({ data: { onboarding, pendaftaran, dokumen } });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data onboarding', error: error.message });
  }
};

// 2. Kandidat merespons penawaran
export const respondOffer = async (req, res) => {
  try {
    const { id } = req.params; // onboarding id
    const { accept } = req.body; // boolean

    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });
    if (!onboarding) return res.status(404).json({ message: 'Onboarding tidak ditemukan' });

    if (accept) {
      const updated = await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { status: 'DOCUMENT_VERIFICATION' }
      });
      res.status(200).json({ message: 'Tawaran diterima', data: updated });
    } else {
      const updated = await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { status: 'REJECTED_BY_CANDIDATE' }
      });
      await prisma.pendaftaran.update({
        where: { id: onboarding.pendaftaran_id },
        data: { status: 'REJECTED' }
      });
      res.status(200).json({ message: 'Tawaran ditolak', data: updated });
    }
  } catch (error) {
    res.status(500).json({ message: 'Gagal merespons', error: error.message });
  }
};

// 3. Admin: Ambil semua onboarding
export const getAllOnboarding = async (req, res) => {
  try {
    const onboardings = await prisma.onboarding.findMany({
      include: {
        pendaftaran: { include: { user: true, lowongan: true } },
        mentor: true
      },
      orderBy: { updated_at: 'desc' }
    });
    res.status(200).json({ data: onboardings });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil list onboarding', error: error.message });
  }
};

// 4. Admin: Verifikasi Dokumen
export const verifyDocuments = async (req, res) => {
  try {
    const { id } = req.params; // onboarding id
    const { approved } = req.body;

    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });

    if (approved) {
      await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { status: 'LOA_ISSUED' } // Atau status selanjutnya, kita langsung minta Admin rilis LoA
      });
      await sendEmail(onboarding.pendaftaran.user.email, 'Dokumen Diterima', 'Dokumen Anda valid. Silakan menunggu penerbitan LoA.');
    } else {
      await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { status: 'DOCUMENT_REVISION' }
      });
      await sendEmail(onboarding.pendaftaran.user.email, 'Revisi Dokumen Onboarding', 'Ada dokumen yang tidak valid. Mohon unggah ulang di portal.');
    }
    res.status(200).json({ message: approved ? 'Dokumen disetujui' : 'Minta revisi dokumen' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memverifikasi', error: error.message });
  }
};

// 5. Admin: Terbitkan LOA
export const issueLoa = async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'File LOA diperlukan' });

    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });

    // Simpan dokumen LOA untuk user
    await prisma.dokumen.create({
      data: {
        user_id: onboarding.pendaftaran.user.id,
        tipe: 'LOA',
        nama_file: file.originalname,
        file_path: `/uploads/${file.filename}`
      }
    });

    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { status: 'PLACEMENT_ASSIGNED' } // Langsung masuk tahap penempatan
    });

    await sendEmail(onboarding.pendaftaran.user.email, 'Letter of Acceptance (LoA) Tersedia', 'LoA Anda sudah terbit. Silakan unduh di portal.');
    res.status(200).json({ message: 'LoA diterbitkan', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menerbitkan LoA', error: error.message });
  }
};

// 6. Admin: Tetapkan Divisi dan Mentor
export const assignPlacement = async (req, res) => {
  try {
    const { id } = req.params;
    const { divisi, mentor_id } = req.body;

    const onboarding = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { 
        divisi, 
        mentor_id: parseInt(mentor_id),
        status: 'ACCOUNT_CREATED' // Langsung set status berikutnya untuk disiapkan checklist
      },
      include: { pendaftaran: { include: { user: true } } }
    });

    // Buat checklist default untuk kandidat
    const defaultTasks = [
      'Membaca aturan perusahaan',
      'Menandatangani NDA',
      'Melengkapi profil',
      'Mengunduh LoA',
      'Bergabung ke grup komunikasi'
    ];

    for (const task of defaultTasks) {
      await prisma.onboardingChecklist.create({
        data: { onboarding_id: parseInt(id), tugas: task }
      });
    }

    res.status(200).json({ message: 'Placement ditetapkan', data: onboarding });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menetapkan placement', error: error.message });
  }
};

// 7. Admin: Buat akun (Upgrade Role)
export const createAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });

    // Generate id_magang
    const id_magang = `MAG-${new Date().getFullYear()}-${onboarding.pendaftaran.user.id.toString().padStart(4, '0')}`;

    // Upgrade role
    await prisma.user.update({
      where: { id: onboarding.pendaftaran.user.id },
      data: { 
        role: 'MAGANG',
        divisi: onboarding.divisi,
        mentor: onboarding.mentor_id ? String(onboarding.mentor_id) : null, // Assuming mentor name needs to be looked up, but saving ID is better in DB
      }
    });

    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { status: 'CHECKLIST_IN_PROGRESS' }
    });

    await sendEmail(onboarding.pendaftaran.user.email, 'Akun Magang Aktif', `Akun magang Anda siap. Role Anda sudah di-upgrade menjadi MAGANG. Silakan lanjutkan checklist onboarding.`);
    res.status(200).json({ message: 'Akun dibuat/diupgrade', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal buat akun', error: error.message });
  }
};

// 8. Admin: Jadwalkan Orientasi
export const scheduleOrientation = async (req, res) => {
  try {
    const { id } = req.params;
    const { jadwal_orientasi, link_orientasi, lokasi_orientasi } = req.body;

    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: {
        jadwal_orientasi: new Date(jadwal_orientasi),
        link_orientasi,
        lokasi_orientasi,
        status: 'ORIENTATION_SCHEDULED'
      },
      include: { pendaftaran: { include: { user: true } } }
    });

    await sendEmail(updated.pendaftaran.user.email, 'Jadwal Orientasi Magang', `Orientasi dijadwalkan pada ${jadwal_orientasi}. Silakan cek portal untuk link/lokasinya dan lakukan konfirmasi kehadiran.`);
    res.status(200).json({ message: 'Jadwal orientasi dibuat', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menjadwalkan', error: error.message });
  }
};

// 9. Kandidat: Update Checklist
export const updateChecklist = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { is_completed } = req.body;

    const task = await prisma.onboardingChecklist.update({
      where: { id: parseInt(taskId) },
      data: { is_completed }
    });
    res.status(200).json({ message: 'Checklist diupdate', data: task });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update checklist', error: error.message });
  }
};

// 10. Kandidat: Konfirmasi Orientasi
export const confirmOrientation = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { konfirmasi_hadir: true, status: 'COMPLETED' },
      include: { pendaftaran: { include: { user: true } } }
    });

    await sendEmail(updated.pendaftaran.user.email, 'Onboarding Selesai', `Terima kasih atas konfirmasinya. Onboarding Anda telah selesai. Anda sekarang adalah Peserta Aktif Magang!`);
    res.status(200).json({ message: 'Konfirmasi berhasil, Onboarding selesai', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal konfirmasi', error: error.message });
  }
};
