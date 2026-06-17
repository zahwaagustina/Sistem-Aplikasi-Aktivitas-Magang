import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ambil daftar anak bimbingan
export const getAnakMagang = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const magangList = await prisma.profilMagang.findMany({
      where: { mentor_id: mentorId },
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

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak atau data tidak ditemukan' });
    }

    const logbooks = await prisma.aktivitasHarian.findMany({
      where: { user_id: parseInt(id) },
      include: { lampiran: true },
      orderBy: { tanggal: 'desc' }
    });

    const tugas = await prisma.tugas.findMany({
      where: { peserta_id: parseInt(id), mentor_id: mentorId },
      orderBy: { deadline: 'asc' }
    });

    const evaluasi = await prisma.evaluasi.findMany({
      where: { peserta_id: parseInt(id), mentor_id: mentorId },
      orderBy: { created_at: 'desc' }
    });

    const absensi = await prisma.absensi.findMany({
      where: { user_id: parseInt(id) },
      orderBy: { tanggal: 'desc' }
    });

    res.json({
      data: {
        profil: profilMagang,
        logbooks,
        tugas,
        evaluasi,
        absensi
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Submit Evaluasi
export const submitEvaluasi = async (req, res) => {
  try {
    const { id } = req.params; // peserta_id
    const mentorId = req.user.id;
    const { tipe, skor_teknis, skor_komunikasi, skor_disiplin, skor_inisiatif, skor_teamwork, feedback } = req.body;

    // Pastikan anak magang ini adalah bimbingan mentor ini
    const profilMagang = await prisma.profilMagang.findUnique({
      where: { user_id: parseInt(id) }
    });

    if (!profilMagang || profilMagang.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Akses ditolak' });
    }

    const evaluasi = await prisma.evaluasi.create({
      data: {
        peserta_id: parseInt(id),
        mentor_id: mentorId,
        tipe,
        skor_teknis: parseFloat(skor_teknis),
        skor_komunikasi: parseFloat(skor_komunikasi),
        skor_disiplin: parseFloat(skor_disiplin),
        skor_inisiatif: parseFloat(skor_inisiatif),
        skor_teamwork: parseFloat(skor_teamwork),
        feedback
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

    res.json({ message: 'Logbook berhasil diupdate', data: updatedLogbook });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
