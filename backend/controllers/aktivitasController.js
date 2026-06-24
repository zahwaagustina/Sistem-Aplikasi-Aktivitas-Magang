import { PrismaClient } from '@prisma/client';
import { aktivitasSchema } from '../validators/validation.js';
import ExcelJS from 'exceljs';

const prisma = new PrismaClient();

export const createAktivitas = async (req, res) => {
  try {
    const validatedData = aktivitasSchema.parse(req.body);
    const inputDate = new Date(validatedData.tanggal);

    // Cek apakah user sudah mengisi logbook di tanggal yang sama
    const startOfDay = new Date(inputDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(inputDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAktivitas = await prisma.aktivitasHarian.findFirst({
      where: {
        user_id: req.user.id,
        tanggal: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (existingAktivitas) {
      return res.status(400).json({ message: 'Anda sudah mengisi logbook untuk tanggal ini.' });
    }

    // Hitung batas waktu: H+1 jam 17.00
    const deadline = new Date(inputDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(17, 0, 0, 0);

    const now = new Date();
    let finalStatus = validatedData.status || 'DRAFT';
    
    // Jika user menekan tombol 'Kirim', cek apakah telat
    if (finalStatus === 'TERKIRIM' && now > deadline) {
      finalStatus = 'TELAT_MENGISI';
    }

    const aktivitas = await prisma.aktivitasHarian.create({
      data: {
        ...validatedData,
        tanggal: inputDate,
        user_id: req.user.id,
        status: finalStatus
      }
    });

    res.status(201).json({ message: 'Aktivitas berhasil dibuat', data: aktivitas });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllAktivitas = async (req, res) => {
  try {
    // MAGANG hanya melihat miliknya. ADMIN/PEMBIMBING melihat semua kecuali DRAFT.
    let where = {};
    if (req.user.role === 'MAGANG') {
      where = { user_id: req.user.id };
    } else if (req.user.role === 'PEMBIMBING' || req.user.role === 'MENTOR') {
      const myInterns = await prisma.profilMagang.findMany({
        where: { mentor_id: req.user.id },
        select: { user_id: true }
      });
      const myInternIds = myInterns.map(i => i.user_id);
      
      where = { 
        user_id: { in: myInternIds },
        status: { not: 'DRAFT' } 
      };
    } else {
      where = { status: { not: 'DRAFT' } };
    }

    const aktivitas = await prisma.aktivitasHarian.findMany({
      where,
      include: {
        user: {
          select: { nama: true }
        },
        lampiran: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json({ data: aktivitas });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAktivitasById = async (req, res) => {
  try {
    const { id } = req.params;
    const aktivitas = await prisma.aktivitasHarian.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { nama: true }
        },
        lampiran: true
      }
    });

    if (!aktivitas) return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });

    if (req.user.role === 'MAGANG' && aktivitas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.status(200).json({ data: aktivitas });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateAktivitas = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = aktivitasSchema.parse(req.body);

    const aktivitas = await prisma.aktivitasHarian.findUnique({ where: { id: parseInt(id) } });
    if (!aktivitas) return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });

    if (req.user.role === 'MAGANG' && aktivitas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'MAGANG' && !['DRAFT', 'TERKIRIM', 'REVISI'].includes(aktivitas.status)) {
      return res.status(403).json({ message: 'Tidak dapat mengedit aktivitas yang sudah disetujui atau telat' });
    }

    const inputDate = new Date(validatedData.tanggal);

    // Hitung batas waktu: H+1 jam 17.00
    const deadline = new Date(inputDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(17, 0, 0, 0);

    const now = new Date();
    let finalStatus = validatedData.status || aktivitas.status;
    
    // Jika user menekan tombol 'Kirim' atau update dari draft ke terkirim, cek apakah telat
    if (finalStatus === 'TERKIRIM' && now > deadline) {
      finalStatus = 'TELAT_MENGISI';
    }

    const updated = await prisma.aktivitasHarian.update({
      where: { id: parseInt(id) },
      data: {
        ...validatedData,
        tanggal: inputDate,
        status: finalStatus
      }
    });

    res.status(200).json({ message: 'Aktivitas berhasil diupdate', data: updated });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const approveAktivitas = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expects 'DISETUJUI' or 'TELAT_MENGISI'

    if (!['DISETUJUI', 'REVISI', 'TELAT_MENGISI'].includes(status)) {
      return res.status(400).json({ message: 'Status review tidak valid' });
    }

    const aktivitas = await prisma.aktivitasHarian.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Notifikasi ke peserta magang
    await prisma.notifikasi.create({
      data: {
        user_id: aktivitas.user_id,
        judul: 'Review Logbook',
        pesan: `Logbook Anda tanggal ${new Date(aktivitas.tanggal).toLocaleDateString('id-ID')} telah di-review dengan status ${status}.`,
        link: '/magang/logbook'
      }
    });

    res.status(200).json({ message: `Aktivitas berhasil di-${status.toLowerCase()}`, data: aktivitas });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const kirimAktivitas = async (req, res) => {
  try {
    const { id } = req.params;

    const aktivitas = await prisma.aktivitasHarian.findUnique({ where: { id: parseInt(id) } });
    if (!aktivitas) return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });

    if (aktivitas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (aktivitas.status !== 'DRAFT') {
      return res.status(400).json({ message: 'Hanya draft yang dapat dikirim' });
    }

    // Hitung batas waktu: H+1 jam 17.00
    const inputDate = new Date(aktivitas.tanggal);
    const deadline = new Date(inputDate);
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(17, 0, 0, 0);

    const now = new Date();
    const finalStatus = now > deadline ? 'TELAT_MENGISI' : 'TERKIRIM';

    const updated = await prisma.aktivitasHarian.update({
      where: { id: parseInt(id) },
      data: { status: finalStatus },
      include: { user: { select: { nama: true, profilMagang: { select: { mentor_id: true } } } } }
    });

    // Notifikasi ke mentor
    if (updated.user.profilMagang?.mentor_id) {
      await prisma.notifikasi.create({
        data: {
          user_id: updated.user.profilMagang.mentor_id,
          judul: 'Logbook Baru Terkirim',
          pesan: `Peserta ${updated.user.nama} telah mengirimkan logbook untuk direview.`,
          link: `/mentor/profil-magang?userId=${aktivitas.user_id}&tab=logbook`
        }
      });
    }

    res.status(200).json({ message: 'Aktivitas berhasil dikirim', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteAktivitas = async (req, res) => {
  try {
    const { id } = req.params;

    const aktivitas = await prisma.aktivitasHarian.findUnique({ where: { id: parseInt(id) } });
    if (!aktivitas) return res.status(404).json({ message: 'Aktivitas tidak ditemukan' });

    if (req.user.role === 'MAGANG' && aktivitas.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (req.user.role === 'MAGANG' && !['DRAFT', 'TERKIRIM'].includes(aktivitas.status)) {
      return res.status(403).json({ message: 'Tidak dapat menghapus aktivitas yang sudah direview' });
    }

    await prisma.aktivitasHarian.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Aktivitas berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const exportAktivitasBulanan = async (req, res) => {
  try {
    const { monthStr } = req.query; // format: "Juni 2026"
    
    // Build query conditions
    const whereCondition = {
      status: { not: 'DRAFT' } // Only submitted logs
    };

    if (req.user.role === 'MAGANG') {
      whereCondition.user_id = req.user.id;
    }

    const aktivitasList = await prisma.aktivitasHarian.findMany({
      where: whereCondition,
      orderBy: { tanggal: 'asc' },
      include: { user: { select: { nama: true } } }
    });

    // Filter list manually to match month/year string (e.g. "Juni 2026")
    const filteredList = aktivitasList.filter((log) => {
      const date = new Date(log.tanggal);
      const logMonthYear = date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      return logMonthYear === monthStr;
    });

    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Bulanan');

    // Define columns based on user request
    worksheet.columns = [
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Total Time', key: 'time', width: 15 },
      { header: 'Description of Activity', key: 'desc', width: 60 }
    ];

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Group by week (ISO week)
    const getWeek = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + 4 - (d.getDay() || 7));
      const yearStart = new Date(d.getFullYear(), 0, 1);
      return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    };

    const groupedByWeek = {};
    filteredList.forEach(log => {
      const date = new Date(log.tanggal);
      const week = getWeek(date);
      if (!groupedByWeek[week]) groupedByWeek[week] = [];
      groupedByWeek[week].push(log);
    });

    let weekIndex = 1;
    for (const weekKey of Object.keys(groupedByWeek).sort((a, b) => a - b)) {
      const logsInWeek = groupedByWeek[weekKey];
      
      const dates = logsInWeek.map(l => new Date(l.tanggal).getTime());
      const minDate = new Date(Math.min(...dates));
      const maxDate = new Date(Math.max(...dates));
      
      const formatDay = (d) => String(d.getDate()).padStart(2, '0');
      const monthName = minDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      
      const dateRangeStr = minDate.getTime() === maxDate.getTime() 
        ? `${formatDay(minDate)} ${monthName}` 
        : `${formatDay(minDate)}-${formatDay(maxDate)} ${monthName}`;
      
      const weekHeader = `Minggu ke ${weekIndex} (${dateRangeStr})`;
      weekIndex++;
      
      // Add Yellow merged row
      const headerRow = worksheet.addRow([weekHeader]);
      worksheet.mergeCells(`A${headerRow.number}:C${headerRow.number}`);
      const mergedCell = worksheet.getCell(`A${headerRow.number}`);
      mergedCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' } // Yellow
      };
      mergedCell.font = { bold: true };
      mergedCell.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // Add logs
      logsInWeek.forEach(log => {
        const dateStr = new Date(log.tanggal).toLocaleDateString('en-GB'); // DD/MM/YYYY
        const timeStr = `${log.waktu_mulai} - ${log.waktu_selesai}`;
        
        const lines = log.deskripsi_kegiatan.split('\n').filter(l => l.trim() !== '');
        
        if (lines.length === 0) {
          worksheet.addRow({ date: dateStr, time: timeStr, desc: '' });
        } else {
          lines.forEach((line, idx) => {
            if (idx === 0) {
              worksheet.addRow({ date: dateStr, time: timeStr, desc: line });
            } else {
              worksheet.addRow({ date: '', time: '', desc: line });
            }
          });
        }
      });
    }

    // Apply borders and alignment to all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        // Center align Date and Time columns (A and B), left align Desc (C) unless it's the week header
        if (rowNumber > 1 && !row.getCell(1).isMerged) {
          if (colNumber === 1 || colNumber === 2) {
            cell.alignment = { horizontal: 'center', vertical: 'top' };
          } else {
            cell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
          }
        }
      });
    });

    // Set response headers to trigger download
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Laporan_Magang_${monthStr.replace(/\s+/g, '_')}.xlsx`
    );

    // Write to response stream
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting excel:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server saat export', error: error.message });
  }
};
