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

    // Register Custom Font for Signature/Name
    const fontPath = path.join(__dirname, '..', 'uploads', 'fonts', 'DancingScript.ttf');
    let hasCustomFont = false;
    if (fs.existsSync(fontPath)) {
      doc.registerFont('Cursive', fontPath);
      hasCustomFont = true;
    }

    // Coordinates mapping based on the visual layout provided
    const textX = 80;
    
    doc.fontSize(14).fillColor('#111827').text('Dengan bangga diberikan kepada :', textX, 220);
    
    if (hasCustomFont) {
      doc.font('Cursive').fontSize(50).fillColor('#1e1b4b').text(profilMagang.user.nama, textX, 250);
    } else {
      doc.font('Helvetica-Bold').fontSize(35).fillColor('#1e1b4b').text(profilMagang.user.nama, textX, 260);
    }
    
    // Reset font back to default (Helvetica)
    doc.font('Helvetica');
    
    // Text Mahasiswa
    const jurusanText = profilMagang.user.jurusan || 'Teknologi Informasi';
    const univText = profilMagang.user.universitas || 'Universitas';
    doc.fontSize(12).fillColor('#4b5563').font('Helvetica-Oblique')
       .text(`Mahasiswa/i ${jurusanText} ${univText}`, textX, 330);
       
    doc.font('Helvetica');
    
    const tglMulai = profilMagang.tanggal_mulai ? new Date(profilMagang.tanggal_mulai).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'}) : '-';
    const tglSelesai = profilMagang.tanggal_selesai ? new Date(profilMagang.tanggal_selesai).toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'}) : '-';
    
    doc.fontSize(12).fillColor('#1f2937').text(
      `Telah menyelesaikan program magang di perusahaan pada divisi ${profilMagang.divisi || '-'} ` +
      `dimulai pada ${tglMulai} hingga ${tglSelesai}`,
      textX, 360, { width: 500, align: 'left', lineGap: 4 }
    );

    // KETUA PANITIA / MENTOR section
    // In template it is around x=580, y=450
    // Signature placeholder
    // We don't draw the signature line if using template, as template has it.
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
