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
        user: { include: { profilKandidat: true, dokumen: true } }
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
      where: { user_id: userId, tipe: { in: ['KTP', 'NDA', 'PAKTA_INTEGRITAS', 'LOA', 'SURAT_PENGANTAR', 'SURAT_KERJASAMA'] } }
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

export const downloadLoa = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { is_loa_downloaded: true }
    });
    res.status(200).json({ message: 'LoA downloaded', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Error updating download status', error: error.message });
  }
};

// 3. Admin: Ambil semua onboarding
export const getAllOnboarding = async (req, res) => {
  try {
    const onboardings = await prisma.onboarding.findMany({
      include: {
        pendaftaran: { 
          include: { 
            user: { 
              include: { 
                profilKandidat: true,
                dokumen: true 
              } 
            }, 
            lowongan: true 
          } 
        },
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
    const { approved, catatan_revisi, dokumen_revisi } = req.body;

    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });

    if (approved) {
      await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'LOA_ISSUED',
          catatan_revisi: null,
          dokumen_revisi: null
        } // Lanjut ke LOA_ISSUED
      });
      await sendEmail(onboarding.pendaftaran.user.email, 'Dokumen Diterima', 'Dokumen Anda valid. Silakan menunggu penerbitan LoA.');
      await prisma.notifikasi.create({
        data: {
          user_id: onboarding.pendaftaran.user.id,
          judul: 'Pembaruan Status Onboarding',
          pesan: 'Dokumen Anda telah divalidasi oleh Tim HR. Menunggu penerbitan Letter of Acceptance (LoA).'
        }
      });
    } else {
      await prisma.onboarding.update({
        where: { id: parseInt(id) },
        data: { 
          status: 'DOCUMENT_REVISION',
          catatan_revisi: catatan_revisi || 'Ada dokumen yang tidak valid.',
          dokumen_revisi: dokumen_revisi || [] 
        }
      });
      await sendEmail(onboarding.pendaftaran.user.email, 'Revisi Dokumen Onboarding', 'Ada dokumen yang tidak valid. Mohon unggah ulang di portal.');
      await prisma.notifikasi.create({
        data: {
          user_id: onboarding.pendaftaran.user.id,
          judul: 'Revisi Dokumen',
          pesan: 'Ada dokumen Anda yang perlu direvisi. Silakan cek halaman Onboarding untuk melihat detail dan mengunggah ulang.'
        }
      });
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
    const { npm } = req.body;
    
    const onboarding = await prisma.onboarding.findUnique({ 
      where: { id: parseInt(id) }, 
      include: { 
        pendaftaran: { 
          include: { 
            user: { include: { profilKandidat: true } },
            lowongan: true 
          } 
        } 
      } 
    });

    if (!onboarding) return res.status(404).json({ message: 'Onboarding tidak ditemukan' });

    // Update NPM if provided
    if (npm) {
      await prisma.profilKandidat.update({
        where: { user_id: onboarding.pendaftaran.user.id },
        data: { npm }
      });
      // update local reference
      if(onboarding.pendaftaran.user.profilKandidat) {
         onboarding.pendaftaran.user.profilKandidat.npm = npm;
      }
    }

    // Generate Penomoran
    const monthRoman = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const count = await prisma.dokumen.count({ where: { tipe: 'LOA' } });
    const nomorUrut = (count + 1).toString().padStart(3, '0');
    const nomorSurat = `${nomorUrut}/LOA-MAGANG/PCS/${monthRoman[currentMonth]}/${currentYear}`;

    // Generate PDF
    const { generateLoA } = await import('../utils/pdfGenerator.js');
    const filename = `onb-loa-${Date.now()}.pdf`;
    const filepath = `uploads/${filename}`;
    
    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const tanggalTerbit = `Tangerang, ${new Date().toLocaleDateString('id-ID', dateOptions)}`;

    const pdfData = {
      nomorSurat,
      nama: onboarding.pendaftaran.user.nama,
      npm: npm || onboarding.pendaftaran.user.profilKandidat?.npm || '-',
      universitas: onboarding.pendaftaran.user.profilKandidat?.universitas || '-',
      tanggalTerbit,
      adminName: req.user.nama || 'HR Admin'
    };

    const path = await import('path');
    const fullPath = path.resolve(filepath);
    await generateLoA(pdfData, fullPath);

    // Hapus dokumen LOA yang lama jika ada (untuk regenerasi)
    await prisma.dokumen.deleteMany({
      where: {
        user_id: onboarding.pendaftaran.user.id,
        tipe: 'LOA'
      }
    });

    // Simpan dokumen LOA untuk user
    await prisma.dokumen.create({
      data: {
        user_id: onboarding.pendaftaran.user.id,
        tipe: 'LOA',
        nama_file: `LoA_${onboarding.pendaftaran.user.nama.replace(/\s+/g, '_')}.pdf`,
        file_path: `/${filepath}`
      }
    });

    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { status: 'LOA_ISSUED' } // Masuk ke tahap LOA Diterbitkan
    });

    await sendEmail(onboarding.pendaftaran.user.email, 'Letter of Acceptance (LoA) Tersedia', 'LoA Anda sudah terbit. Silakan unduh di portal.');
    
    await prisma.notifikasi.create({
      data: {
        user_id: onboarding.pendaftaran.user.id,
        judul: 'LoA Diterbitkan',
        pesan: 'Letter of Acceptance (LoA) Anda sudah terbit. Silakan cek halaman Onboarding untuk mengunduhnya.'
      }
    });

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

    const onboarding = await prisma.onboarding.findUnique({
      where: { id: parseInt(id) },
      include: { pendaftaran: { include: { user: true } } }
    });

    if (!onboarding) return res.status(404).json({ message: 'Onboarding tidak ditemukan' });

    const userId = onboarding.pendaftaran.user.id;
    const id_magang = `MAG-${new Date().getFullYear()}-${userId.toString().padStart(4, '0')}`;

    const profilKandidat = await prisma.profilKandidat.findUnique({
      where: { user_id: userId }
    });

    await prisma.user.update({
      where: { id: userId },
      data: { role: 'MAGANG' }
    });

    await prisma.profilMagang.upsert({
      where: { user_id: userId },
      update: {
        id_magang,
        divisi,
        mentor_id: parseInt(mentor_id),
        universitas: profilKandidat?.universitas,
        jurusan: profilKandidat?.jurusan,
        angkatan: profilKandidat?.angkatan,
        semester: profilKandidat?.semester,
        lokasi: 'Kadu, Tangerang'
      },
      create: {
        user_id: userId,
        id_magang,
        divisi,
        mentor_id: parseInt(mentor_id),
        universitas: profilKandidat?.universitas,
        jurusan: profilKandidat?.jurusan,
        angkatan: profilKandidat?.angkatan,
        semester: profilKandidat?.semester,
        lokasi: 'Kadu, Tangerang'
      }
    });

    const updatedOnboarding = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { 
        divisi, 
        mentor_id: parseInt(mentor_id),
        status: 'CHECKLIST_IN_PROGRESS' 
      }
    });

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

    // Notifikasi untuk Kandidat
    await prisma.notifikasi.create({
      data: {
        user_id: userId,
        judul: 'Akun Magang Aktif & Informasi Penempatan',
        pesan: `Selamat! Akun Anda telah di-upgrade. Anda ditempatkan di divisi ${divisi}. Silakan selesaikan Checklist Onboarding Anda.`
      }
    });
    
    // Notifikasi untuk Mentor
    if (mentor_id) {
      await prisma.notifikasi.create({
        data: {
          user_id: parseInt(mentor_id),
          judul: 'Penugasan Peserta Magang Baru',
          pesan: `Anda telah ditugaskan sebagai mentor untuk peserta magang baru: ${onboarding.pendaftaran.user.nama} di divisi ${divisi}.`
        }
      });
    }

    res.status(200).json({ message: 'Penempatan ditetapkan & Akun diupgrade', data: updatedOnboarding });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menetapkan penempatan', error: error.message });
  }
};

// 7. Admin: Buat akun (Upgrade Role)
export const createAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const onboarding = await prisma.onboarding.findUnique({ where: { id: parseInt(id) }, include: { pendaftaran: { include: { user: true } } } });

    const userId = onboarding.pendaftaran.user.id;

    // Generate id_magang
    const id_magang = `MAG-${new Date().getFullYear()}-${userId.toString().padStart(4, '0')}`;

    // Get candidate profile to copy academic data
    const profilKandidat = await prisma.profilKandidat.findUnique({
      where: { user_id: userId }
    });

    // Upgrade role in User table
    await prisma.user.update({
      where: { id: userId },
      data: { 
        role: 'MAGANG'
      }
    });

    // Create ProfilMagang with data copied from ProfilKandidat
    await prisma.profilMagang.upsert({
      where: { user_id: userId },
      update: {
        id_magang: id_magang,
        divisi: onboarding.divisi,
        mentor_id: onboarding.mentor_id,
        universitas: profilKandidat?.universitas,
        jurusan: profilKandidat?.jurusan,
        angkatan: profilKandidat?.angkatan,
        semester: profilKandidat?.semester,
        // Set fixed lokasi as requested previously, or leave null to let profile fallback handle it
        lokasi: 'Kadu, Tangerang'
      },
      create: {
        user_id: userId,
        id_magang: id_magang,
        divisi: onboarding.divisi,
        mentor_id: onboarding.mentor_id,
        universitas: profilKandidat?.universitas,
        jurusan: profilKandidat?.jurusan,
        angkatan: profilKandidat?.angkatan,
        semester: profilKandidat?.semester,
        lokasi: 'Kadu, Tangerang'
      }
    });

    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { status: 'CHECKLIST_IN_PROGRESS' }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: userId,
        judul: 'Akun Magang Aktif',
        pesan: 'Selamat! Akun Anda telah di-upgrade. Anda sekarang dapat mengakses menu khusus peserta magang aktif.'
      }
    });

    await sendEmail(onboarding.pendaftaran.user.email, 'Akun Magang Aktif', `Akun magang Anda siap. Role Anda sudah di-upgrade menjadi MAGANG. Silakan lanjutkan checklist onboarding.`);
    res.status(200).json({ message: 'Akun dibuat/diupgrade', data: updated });
  } catch (error) {
    console.error("Create account error:", error);
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
        status: 'COMPLETED'
      },
      include: { pendaftaran: { include: { user: true } } }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: updated.pendaftaran.user.id,
        judul: 'Jadwal Orientasi',
        pesan: `Jadwal orientasi Anda telah ditetapkan pada tanggal ${new Date(jadwal_orientasi).toLocaleString('id-ID')}. Mohon cek halaman Onboarding untuk konfirmasi kehadiran.`
      }
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

    await sendEmail(updated.pendaftaran.user.email, 'Orientasi Dikonfirmasi', 'Terima kasih telah mengonfirmasi kehadiran orientasi. Sampai jumpa!');
    res.status(200).json({ message: 'Orientasi dikonfirmasi', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengonfirmasi', error: error.message });
  }
};

// 10. Kandidat: Unggah Dokumen Onboarding (KTP)
export const uploadOnboardingDocs = async (req, res) => {
  try {
    const { id } = req.params; // onboarding id
    const userId = req.user.id;
    const files = req.files;

    if (!files || (!files['ktp'] && !files['surat_pengantar'] && !files['surat_kerjasama'])) {
      return res.status(400).json({ message: 'Tidak ada dokumen yang diunggah.' });
    }

    const onboarding = await prisma.onboarding.findUnique({
      where: { id: parseInt(id) },
      include: { pendaftaran: true }
    });

    if (!onboarding || onboarding.pendaftaran.user_id !== userId) {
      return res.status(403).json({ message: 'Akses ditolak.' });
    }

    // Fungsi bantu untuk simpan/update dokumen
    const saveDokumen = async (fileArray, tipeDokumen) => {
      if (fileArray && fileArray.length > 0) {
        const fileInfo = fileArray[0];
        const existingDoc = await prisma.dokumen.findFirst({ where: { user_id: userId, tipe: tipeDokumen } });
        if (existingDoc) {
          await prisma.dokumen.update({
            where: { id: existingDoc.id },
            data: { nama_file: fileInfo.originalname, file_path: `/uploads/${fileInfo.filename}` }
          });
        } else {
          await prisma.dokumen.create({
            data: {
              user_id: userId,
              tipe: tipeDokumen,
              nama_file: fileInfo.originalname,
              file_path: `/uploads/${fileInfo.filename}`
            }
          });
        }
      }
    };

    // Save Documents
    await saveDokumen(files['ktp'], 'KTP');
    await saveDokumen(files['surat_pengantar'], 'SURAT_PENGANTAR');
    await saveDokumen(files['surat_kerjasama'], 'SURAT_KERJASAMA');

    // Update status to DOCUMENT_VERIFICATION so Admin knows it's ready for review
    const updated = await prisma.onboarding.update({
      where: { id: parseInt(id) },
      data: { status: 'DOCUMENT_VERIFICATION' }
    });

    // Notify Admin (we'll notify all SUPER_ADMIN)
    const admins = await prisma.user.findMany({ where: { role: { in: ['SUPER_ADMIN'] } } });
    if (admins.length > 0) {
      const notifs = admins.map(admin => ({
        user_id: admin.id,
        judul: 'Dokumen Onboarding Baru',
        pesan: `Kandidat telah mengunggah dokumen onboarding (KTP). Silakan verifikasi.`,
        link: '/hr/onboarding'
      }));
      for (const notif of notifs) {
        await prisma.notifikasi.create({ data: notif });
      }
    }

    res.status(200).json({ message: 'Dokumen berhasil diunggah', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah dokumen', error: error.message });
  }
};
