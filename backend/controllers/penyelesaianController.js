import { PrismaClient } from '@prisma/client';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadLaporan = async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: 'File laporan wajib diunggah' });
    }

    const file_path = `/uploads/laporan/${req.file.filename}`;

    // Cek apakah sudah ada laporan akhir
    const existingDokumen = await prisma.dokumen.findFirst({
      where: { user_id: userId, tipe: 'LAPORAN_AKHIR' }
    });

    let dokumen;
    if (existingDokumen) {
      dokumen = await prisma.dokumen.update({
        where: { id: existingDokumen.id },
        data: { nama_file: req.file.originalname, file_path }
      });
    } else {
      dokumen = await prisma.dokumen.create({
        data: {
          user_id: userId,
          tipe: 'LAPORAN_AKHIR',
          nama_file: req.file.originalname,
          file_path
        }
      });
    }

    await prisma.notifikasi.create({
      data: {
        user_id: userId,
        judul: 'Laporan Akhir Terkirim',
        pesan: 'Laporan akhir Anda berhasil diunggah. Silakan menunggu proses penerbitan Sertifikat Kelulusan oleh Mentor.'
      }
    });

    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: userId },
      include: { user: { select: { nama: true } } }
    });

    if (profilMagang && profilMagang.mentor_id) {
      await prisma.notifikasi.create({
        data: {
          user_id: profilMagang.mentor_id,
          judul: 'Laporan Akhir Peserta',
          pesan: `Peserta ${profilMagang.user?.nama || 'magang Anda'} telah mengunggah Laporan Akhir dan menunggu evaluasi / penerbitan Sertifikat Kelulusan.`,
          link: `/mentor/profil-magang?userId=${userId}&tab=evaluasi`
        }
      });
    }

    res.json({ message: 'Laporan akhir berhasil diunggah', data: dokumen });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

export const getPenyelesaianStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: userId }
    });

    if (!profilMagang) {
      return res.status(404).json({ message: 'Profil magang tidak ditemukan' });
    }

    const dokumenLaporan = await prisma.dokumen.findFirst({
      where: { user_id: userId, tipe: 'LAPORAN_AKHIR' }
    });

    const dokumenSertifikat = await prisma.dokumen.findFirst({
      where: { user_id: userId, tipe: 'SERTIFIKAT' }
    });

    const evaluasi = await prisma.hasilEvaluasi.findFirst({
      where: { peserta_id: userId, tipe: 'FINAL' },
      include: {
        detailEvaluasi: {
          include: {
            pertanyaan: {
              include: {
                aspek: true
              }
            }
          }
        }
      }
    });

    res.json({
      data: {
        status_magang: profilMagang.status,
        laporan_akhir: dokumenLaporan || null,
        sertifikat: dokumenSertifikat || null,
        evaluasi: evaluasi || null,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

export const generateSertifikat = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { userId } = req.params;
    const targetUserId = parseInt(userId);

    // Verifikasi mentor
    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: targetUserId },
      include: { user: true }
    });

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak atau peserta tidak ditemukan' });
    }

    // Pastikan laporan akhir sudah ada
    const laporanAkhir = await prisma.dokumen.findFirst({
      where: { user_id: targetUserId, tipe: 'LAPORAN_AKHIR' }
    });

    if (!laporanAkhir) {
      return res.status(400).json({ message: 'Peserta belum mengunggah Laporan Akhir' });
    }

    // Pastikan mentor sudah memberikan Evaluasi Akhir (FINAL)
    const evaluasiFinal = await prisma.hasilEvaluasi.findFirst({
      where: { peserta_id: targetUserId, tipe: 'FINAL' }
    });

    if (!evaluasiFinal) {
      return res.status(400).json({ message: 'Tidak dapat meluluskan. Anda belum memberikan Evaluasi Akhir (Final) untuk peserta ini.' });
    }

    // Ubah status jadi SELESAI
    await prisma.profilMagang.update({
      where: { id: profilMagang.id },
      data: { status: 'SELESAI' }
    });

    // Generate PDF Sertifikat
    const sertifikatPathName = `sertifikat-${targetUserId}-${Date.now()}.pdf`;
    const fullPath = path.join(__dirname, '..', 'uploads', 'dokumen', sertifikatPathName);

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0 // Remove margins for full background
    });

    doc.pipe(fs.createWriteStream(fullPath));

    // Cek apakah ada file template_sertifikat.png
    const templatePath = path.join(__dirname, '..', 'uploads', 'template_sertifikat.png');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
    } else {
      // Fallback jika belum di-upload
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4f46e5');
      doc.fontSize(40).fillColor('#1e1b4b').text('SERTIFIKAT KELULUSAN', 0, 80, { align: 'center' });
    }

    // Coordinates mapping
    const nameY = 290; // Posisi vertikal tepat di atas garis panjang

    // Hanya cetak "Dengan bangga diberikan kepada" jika tidak ada template
    if (!fs.existsSync(templatePath)) {
      doc.fontSize(14).fillColor('#111827').text('Dengan bangga diberikan kepada :', 0, 220, { align: 'center', width: doc.page.width });
    }

    // Cetak Nama Peserta secara rata tengah (Center) dengan font formal yang elegan
    doc.font('Times-Bold').fontSize(40).fillColor('#1e1b4b').text(profilMagang.user.nama.toUpperCase(), 0, nameY, { align: 'center', width: doc.page.width });

    const calibriPath = path.join(__dirname, '..', 'uploads', 'fonts', 'calibri.ttf');
    if (fs.existsSync(calibriPath)) {
      doc.font(calibriPath);
    } else {
      doc.font('Helvetica');
    }

    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: { user_id: targetUserId, status: 'ACCEPTED' },
      include: { lowongan: { include: { program: true } }, onboarding: true },
      orderBy: { created_at: 'desc' }
    });

    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const effectiveTglMulai = profilMagang.tanggal_mulai || pendaftaran?.onboarding?.jadwal_orientasi || pendaftaran?.lowongan?.program?.tanggal_mulai;
    const effectiveTglSelesai = profilMagang.tanggal_selesai || pendaftaran?.lowongan?.program?.tanggal_selesai;

    const tglMulai = effectiveTglMulai ? new Date(effectiveTglMulai).toLocaleDateString('id-ID', dateOptions) : 'TBD';
    const tglSelesai = effectiveTglSelesai ? new Date(effectiveTglSelesai).toLocaleDateString('id-ID', dateOptions) : 'TBD';

    // Teks kalimat lengkap karena background akan dikosongkan
    const deskripsiText = `Telah menyelesaikan program magang di PT. Pandu Cipta Solusi terhitung sejak\n${tglMulai} sampai dengan ${tglSelesai} dengan baik`;

    // Posisi Y disesuaikan kira-kira di bawah nama
    const descY = nameY + 90;
    doc.fontSize(13).fillColor('#374151').text(deskripsiText, 0, descY, { align: 'center', width: doc.page.width, lineGap: 4 });

    if (!fs.existsSync(templatePath)) {
      doc.fontSize(12).fillColor('#1f2937').text('Ketua Panitia / Mentor', doc.page.width - 250, 480);
    }

    doc.end();

    const dbPath = `/uploads/dokumen/${sertifikatPathName}`;

    // Cek jika sudah pernah di-generate sebelumnya
    const existingSertifikat = await prisma.dokumen.findFirst({
      where: { user_id: targetUserId, tipe: 'SERTIFIKAT' }
    });

    let sertifikatRecord;
    if (existingSertifikat) {
      sertifikatRecord = await prisma.dokumen.update({
        where: { id: existingSertifikat.id },
        data: {
          nama_file: `Sertifikat-${profilMagang.user.nama.replace(/\s+/g, '_')}.pdf`,
          file_path: dbPath
        }
      });
    } else {
      sertifikatRecord = await prisma.dokumen.create({
        data: {
          user_id: targetUserId,
          tipe: 'SERTIFIKAT',
          nama_file: `Sertifikat-${profilMagang.user.nama.replace(/\s+/g, '_')}.pdf`,
          file_path: dbPath
        }
      });
    }

    await prisma.notifikasi.create({
      data: {
        user_id: targetUserId,
        judul: 'Sertifikat Kelulusan Terbit',
        pesan: 'Selamat! Anda telah menyelesaikan program magang. Sertifikat Kelulusan Anda sudah dapat diunduh di portal.'
      }
    });

    res.json({ message: 'Sertifikat berhasil dibuat', data: sertifikatRecord });

  } catch (error) {
    console.error('Generate sertifikat error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

export const testGenerateSertifikat = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);

    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: targetUserId },
      include: { user: true }
    });

    if (!profilMagang) {
      return res.status(404).json({ message: 'Profil magang tidak ditemukan' });
    }

    const pendaftaran = await prisma.pendaftaran.findFirst({
      where: { user_id: targetUserId, status: 'ACCEPTED' },
      include: { lowongan: { include: { program: true } }, onboarding: true },
      orderBy: { created_at: 'desc' }
    });

    // Generate PDF Sertifikat
    const sertifikatPathName = `sertifikat-test-${targetUserId}-${Date.now()}.pdf`;
    const fullPath = path.join(__dirname, '..', 'uploads', 'dokumen', sertifikatPathName);

    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    doc.pipe(fs.createWriteStream(fullPath));

    const templatePath = path.join(__dirname, '..', 'uploads', 'template_sertifikat.png');
    if (fs.existsSync(templatePath)) {
      doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
    } else {
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    }

    const nameY = 290;
    doc.font('Times-Bold').fontSize(40).fillColor('#1e1b4b').text(profilMagang.user.nama.toUpperCase(), 0, nameY, { align: 'center', width: doc.page.width });

    const calibriPath = path.join(__dirname, '..', 'uploads', 'fonts', 'calibri.ttf');
    if (fs.existsSync(calibriPath)) {
      doc.font(calibriPath);
    } else {
      doc.font('Helvetica');
    }

    const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };

    const effectiveTglMulai = profilMagang.tanggal_mulai || pendaftaran?.onboarding?.jadwal_orientasi || pendaftaran?.lowongan?.program?.tanggal_mulai;
    const effectiveTglSelesai = profilMagang.tanggal_selesai || pendaftaran?.lowongan?.program?.tanggal_selesai;

    const tglMulai = effectiveTglMulai ? new Date(effectiveTglMulai).toLocaleDateString('id-ID', dateOptions) : 'TBD';
    const tglSelesai = effectiveTglSelesai ? new Date(effectiveTglSelesai).toLocaleDateString('id-ID', dateOptions) : 'TBD';

    // Teks kalimat lengkap karena background akan dikosongkan
    const deskripsiText = `Telah menyelesaikan program magang di PT. Pandu Cipta Solusi terhitung sejak\n${tglMulai} sampai dengan ${tglSelesai} dengan baik`;

    // Posisi Y disesuaikan kira-kira di bawah nama
    const descY = nameY + 80;
    doc.fontSize(13).fillColor('#374151').text(deskripsiText, 0, descY, { align: 'center', width: doc.page.width, lineGap: 4 });

    doc.end();

    const dbPath = `/uploads/dokumen/${sertifikatPathName}`;

    // Cek jika sudah pernah di-generate sebelumnya
    const existingSertifikat = await prisma.dokumen.findFirst({
      where: { user_id: targetUserId, tipe: 'SERTIFIKAT' }
    });

    if (existingSertifikat) {
      await prisma.dokumen.update({
        where: { id: existingSertifikat.id },
        data: { file_path: dbPath }
      });
    } else {
      await prisma.dokumen.create({
        data: {
          user_id: targetUserId,
          tipe: 'SERTIFIKAT',
          nama_file: `Test-Sertifikat.pdf`,
          file_path: dbPath
        }
      });
    }

    res.json({ message: 'Sertifikat test berhasil di-generate', file_path: dbPath });
  } catch (error) {
    res.status(500).json({ message: 'Gagal test generate sertifikat', error: error.message });
  }
};

export const uploadSertifikatManual = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.userId);
    const mentorId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: 'File sertifikat tidak ditemukan dalam request' });
    }

    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: targetUserId },
      include: {
        user: { select: { nama: true } }
      }
    });

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak. Anda bukan mentor anak magang ini.' });
    }

    // Ubah status jadi SELESAI
    await prisma.profilMagang.update({
      where: { id: profilMagang.id },
      data: { status: 'SELESAI' }
    });

    const dbPath = `/uploads/dokumen/${req.file.filename}`;

    // Cek jika sudah pernah di-generate sebelumnya
    const existingSertifikat = await prisma.dokumen.findFirst({
      where: { user_id: targetUserId, tipe: 'SERTIFIKAT' }
    });

    let sertifikatRecord;
    if (existingSertifikat) {
      sertifikatRecord = await prisma.dokumen.update({
        where: { id: existingSertifikat.id },
        data: {
          nama_file: req.file.originalname,
          file_path: dbPath
        }
      });
    } else {
      sertifikatRecord = await prisma.dokumen.create({
        data: {
          user_id: targetUserId,
          tipe: 'SERTIFIKAT',
          nama_file: req.file.originalname,
          file_path: dbPath
        }
      });
    }

    await prisma.notifikasi.create({
      data: {
        user_id: targetUserId,
        judul: 'Sertifikat Kelulusan Diterbitkan',
        pesan: 'Selamat! Anda telah menyelesaikan program magang. Sertifikat Kelulusan Anda telah diunggah oleh Mentor dan dapat diunduh di portal.'
      }
    });

    res.json({ message: 'Sertifikat berhasil diunggah dan program diselesaikan', data: sertifikatRecord });

  } catch (error) {
    console.error('Upload sertifikat manual error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};
