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

    res.json({
      data: {
        status_magang: profilMagang.status,
        laporan_akhir: dokumenLaporan || null,
        sertifikat: dokumenSertifikat || null,
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

    // Pastikan laporan akhir sudah ada (opsional, tapi disarankan)
    const laporanAkhir = await prisma.dokumen.findFirst({
      where: { user_id: targetUserId, tipe: 'LAPORAN_AKHIR' }
    });

    if (!laporanAkhir) {
      return res.status(400).json({ message: 'Peserta belum mengunggah Laporan Akhir' });
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
    });

    doc.pipe(fs.createWriteStream(fullPath));

    // Draw Certificate
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#ffffff');
    
    // Add border
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#4f46e5');

    doc.fontSize(40).fillColor('#1e1b4b').text('SERTIFIKAT KELULUSAN MAGANG', 0, 150, { align: 'center' });
    doc.fontSize(20).fillColor('#4338ca').text('Diberikan Kepada:', 0, 220, { align: 'center' });
    doc.fontSize(35).fillColor('#111827').text(profilMagang.user.nama, 0, 260, { align: 'center' });
    
    doc.fontSize(16).fillColor('#4b5563').text(`Universitas: ${profilMagang.universitas || '-'}`, 0, 320, { align: 'center' });
    doc.text(`Telah menyelesaikan program magang pada divisi ${profilMagang.divisi || '-'}`, 0, 350, { align: 'center' });
    
    const tglMulai = profilMagang.tanggal_mulai ? new Date(profilMagang.tanggal_mulai).toLocaleDateString('id-ID') : '-';
    const tglSelesai = profilMagang.tanggal_selesai ? new Date(profilMagang.tanggal_selesai).toLocaleDateString('id-ID') : '-';
    doc.text(`Periode: ${tglMulai} s.d. ${tglSelesai}`, 0, 380, { align: 'center' });

    doc.fontSize(14).fillColor('#1f2937').text('Manager HR', 150, 480);
    doc.text('Mentor Pembimbing', doc.page.width - 300, 480);

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

    res.json({ message: 'Sertifikat berhasil dibuat', data: sertifikatRecord });

  } catch (error) {
    console.error('Generate sertifikat error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};
