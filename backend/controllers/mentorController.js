import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ambil daftar anak bimbingan
export const getAnakMagang = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const role = req.user.role;
    
    let whereClause = {
      user: {
        role: { in: ['MAGANG', 'SELESAI'] } // Hanya tampilkan yang sudah fix jadi magang/selesai
      }
    };
    if (role !== 'SUPER_ADMIN') {
      whereClause.mentor_id = mentorId;
    }

    const magangList = await prisma.profilMagang.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            no_telepon: true
          }
        }
      }
    });

    // Ambil logbook statistics
    const userIds = magangList.map(m => m.user_id);
    const logbooks = await prisma.aktivitasHarian.findMany({
      where: { user_id: { in: userIds } }
    });

    const enrichedList = magangList.map(magang => {
      const logs = logbooks.filter(l => l.user_id === magang.user_id);
      return {
        ...magang,
        stats: {
          total_logbook: logs.length,
          pending_review: logs.filter(l => l.status === 'TERKIRIM').length,
          approved: logs.filter(l => l.status === 'DISETUJUI').length
        }
      };
    });

    res.json({ data: enrichedList });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Ambil detail anak bimbingan (profil, logbook, tugas, evaluasi)
export const getDetailAnakMagang = async (req, res) => {
  try {
    const { id } = req.params; // ini user_id dari anak magang
    const mentorId = req.user.id;

    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: parseInt(id) },
      include: {
        user: { select: { id: true, nama: true, email: true, no_telepon: true, role: true } }
      }
    });

    if (!profilMagang) {
      return res.status(404).json({ message: 'Data tidak ditemukan' });
    }
    if (req.user.role !== 'SUPER_ADMIN' && profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const logbooks = await prisma.aktivitasHarian.findMany({
      where: { user_id: parseInt(id) },
      include: { lampiran: true },
      orderBy: { tanggal: 'desc' }
    });

    const tugas = await prisma.tugas.findMany({
      where: req.user.role === 'SUPER_ADMIN' ? { peserta_id: parseInt(id) } : { peserta_id: parseInt(id), mentor_id: mentorId },
      orderBy: { deadline: 'asc' }
    });

    const evaluasi = await prisma.hasilEvaluasi.findMany({
      where: req.user.role === 'SUPER_ADMIN' ? { peserta_id: parseInt(id) } : { peserta_id: parseInt(id), mentor_id: mentorId },
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
      },
      orderBy: { created_at: 'desc' }
    });

    const absensi = await prisma.absensi.findMany({
      where: { user_id: parseInt(id) },
      orderBy: { tanggal: 'desc' }
    });

    const laporan_akhir = await prisma.dokumen.findFirst({
      where: { user_id: parseInt(id), tipe: 'LAPORAN_AKHIR' }
    });

    res.json({
      data: {
        profil: profilMagang,
        logbooks,
        tugas,
        evaluasi,
        absensi,
        laporan_akhir
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Submit Evaluasi
export const submitEvaluasi = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipe, detail_penilaian, feedback } = req.body;
    const mentorId = req.user.id;

    // Pastikan anak magang ini adalah bimbingan mentor ini
    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    // Pastikan anak magang sudah mengunggah laporan akhir
    const laporanAkhir = await prisma.dokumen.findFirst({
      where: { user_id: parseInt(id), tipe: 'LAPORAN_AKHIR' }
    });

    if (!laporanAkhir) {
      return res.status(400).json({ message: 'Peserta belum mengunggah Laporan Akhir. Evaluasi tidak dapat diberikan.' });
    }

    // Ambil data aspek dan pertanyaan untuk menghitung skor akhir
    const aspekPenilaian = await prisma.aspekPenilaian.findMany({
      where: { is_active: true },
      include: {
        pertanyaan: {
          where: { is_active: true }
        }
      }
    });

    let skor_akhir = 0;

    // Hitung subtotal per aspek berdasarkan bobot
    for (const aspek of aspekPenilaian) {
      if (aspek.pertanyaan.length === 0) continue;

      let sumSkorAspek = 0;
      for (const p of aspek.pertanyaan) {
        const jawaban = detail_penilaian.find(d => parseInt(d.pertanyaan_id) === p.id);
        if (jawaban) {
          sumSkorAspek += parseInt(jawaban.skor);
        }
      }

      const maxSkorAspek = aspek.pertanyaan.length * 5;
      const subtotalAspek = (sumSkorAspek / maxSkorAspek) * aspek.bobot;
      skor_akhir += subtotalAspek;
    }

    // Simpan hasil evaluasi
    const evaluasi = await prisma.hasilEvaluasi.create({
      data: {
        peserta_id: parseInt(id),
        mentor_id: mentorId,
        tipe,
        skor_akhir,
        feedback,
        detailEvaluasi: {
          create: detail_penilaian.map(d => ({
            pertanyaan_id: parseInt(d.pertanyaan_id),
            skor: parseInt(d.skor)
          }))
        }
      }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: parseInt(id),
        judul: 'Evaluasi Diterima',
        pesan: `Mentor telah memberikan penilaian untuk Evaluasi ${tipe} Anda.`
      }
    });

    res.status(201).json({ message: 'Evaluasi berhasil disimpan', data: evaluasi });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Approve/Reject Logbook
export const approveLogbook = async (req, res) => {
  try {
    const { id } = req.params; // id aktivitas
    const mentorId = req.user.id;
    const { status, komentar_mentor } = req.body;

    const logbook = await prisma.aktivitasHarian.findUnique({
      where: { id: parseInt(id) },
      include: { user: { include: { profilMagang: true } } }
    });

    if (!logbook) {
      return res.status(404).json({ message: 'Logbook tidak ditemukan' });
    }

    if (logbook.user.profilMagang?.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const updatedLogbook = await prisma.aktivitasHarian.update({
      where: { id: parseInt(id) },
      data: {
        status,
        komentar_mentor
      }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: logbook.user_id,
        judul: 'Review Logbook',
        pesan: `Mentor telah me-review logbook harian Anda pada tanggal ${new Date(logbook.tanggal).toLocaleDateString('id-ID')} dengan status ${status}.`
      }
    });

    res.json({ message: 'Logbook berhasil diupdate', data: updatedLogbook });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// ==========================================
// TUGAS MANAGEMENT
// ==========================================

export const createTugas = async (req, res) => {
  try {
    const { peserta_id, judul, deskripsi, deadline, prioritas } = req.body;
    const mentorId = req.user.id;

    if (!peserta_id || !judul || !deskripsi || !deadline) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const tugas = await prisma.tugas.create({
      data: {
        mentor_id: mentorId,
        peserta_id: parseInt(peserta_id),
        judul,
        deskripsi,
        deadline: new Date(deadline),
        prioritas: prioritas || 'MEDIUM',
        status: 'TODO'
      }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: parseInt(peserta_id),
        judul: 'Tugas Baru Diberikan',
        pesan: `Mentor telah memberikan tugas baru: "${judul}". Segera cek Papan Tugas Anda.`
      }
    });

    res.status(201).json({ message: 'Tugas berhasil dibuat', data: tugas });
  } catch (error) {
    console.error('Create tugas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const deleteTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const mentorId = req.user.id;

    const tugas = await prisma.tugas.findUnique({ where: { id: parseInt(id) } });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    if (tugas.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Anda tidak berhak menghapus tugas ini' });
    }

    await prisma.tugas.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Tugas berhasil dihapus' });
  } catch (error) {
    console.error('Delete tugas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

export const reviewTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    const mentorId = req.user.id;
    const files = req.files;

    let file_feedback = null;
    if (files && files.file_feedback && files.file_feedback.length > 0) {
      file_feedback = '/uploads/' + files.file_feedback[0].filename;
    }

    if (!['DONE', 'IN_PROGRESS'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const tugas = await prisma.tugas.findUnique({ where: { id: parseInt(id) } });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    if (tugas.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Anda tidak berhak me-review tugas ini' });
    }

    const updatedTugas = await prisma.tugas.update({
      where: { id: parseInt(id) },
      data: {
        status,
        feedback: feedback || null,
        ...(file_feedback !== null && { file_feedback })
      }
    });

    const statusText = status === 'DONE' ? 'diterima dan selesai' : 'dikembalikan untuk direvisi';

    await prisma.notifikasi.create({
      data: {
        user_id: tugas.peserta_id,
        judul: 'Hasil Review Tugas',
        pesan: `Tugas "${tugas.judul}" telah di-review oleh mentor dan ${statusText}. Silakan cek Papan Tugas Anda.`
      }
    });

    res.json({ message: 'Review berhasil disimpan', data: updatedTugas });
  } catch (error) {
    console.error('Review tugas error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
};

// Get Rekap Absensi
export const getAbsensiRekap = async (req, res) => {
  try {
    const { id } = req.params; // peserta_id
    const mentorId = req.user.id;

    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const absensiList = await prisma.absensi.findMany({
      where: { user_id: parseInt(id) }
    });

    const rekap = {
      total: absensiList.length,
      hadir: absensiList.filter(a => a.status === 'HADIR').length,
      izin: absensiList.filter(a => a.status === 'IZIN').length,
      sakit: absensiList.filter(a => a.status === 'SAKIT').length,
      alpa: absensiList.filter(a => a.status === 'TANPA_KETERANGAN').length,
    };

    res.status(200).json({ data: rekap });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
