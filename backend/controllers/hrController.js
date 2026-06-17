import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================
// MANAJEMEN KANDIDAT & SELEKSI
// ========================

// Tarik daftar semua pendaftaran
export const getDaftarKandidat = async (req, res) => {
  try {
    const pendaftaran = await prisma.pendaftaran.findMany({
      include: {
        user: {
          select: { id: true, nama: true, email: true, no_telepon: true, profilKandidat: true }
        },
        lowongan: {
          select: { posisi: true, program: { select: { nama: true } } }
        },
        interview: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: pendaftaran });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
};

// Ubah status lamaran secara manual (DRAFT -> SUBMITTED -> REVIEWED -> SHORTLISTED -> REJECTED)
export const updateStatusLamaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, catatan_hr } = req.body;

    const pendaftaran = await prisma.pendaftaran.update({
      where: { id: parseInt(id) },
      data: { status, catatan_hr }
    });

    res.json({ message: `Status berhasil diubah menjadi ${status}`, data: pendaftaran });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui status', error: error.message });
  }
};

// Jadwalkan Wawancara
export const scheduleInterview = async (req, res) => {
  try {
    const { id } = req.params; // ID pendaftaran
    const { tanggal_waktu, link_meeting } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Ubah status pendaftaran menjadi INTERVIEW
      const pendaftaran = await tx.pendaftaran.update({
        where: { id: parseInt(id) },
        data: { status: 'INTERVIEW' }
      });

      // 2. Simpan jadwal ke tabel Interview (upsert agar bisa update jika sudah ada)
      const interview = await tx.interview.upsert({
        where: { pendaftaran_id: pendaftaran.id },
        update: {
          tanggal_waktu: new Date(tanggal_waktu),
          link_meeting
        },
        create: {
          pendaftaran_id: pendaftaran.id,
          tanggal_waktu: new Date(tanggal_waktu),
          link_meeting
        }
      });

      return { pendaftaran, interview };
    });

    res.status(201).json({ message: 'Jadwal interview berhasil dibuat', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menjadwalkan wawancara', error: error.message });
  }
};

// Nilai Wawancara & Keputusan
export const submitNilaiInterview = async (req, res) => {
  try {
    const { id } = req.params; // ID pendaftaran
    const { hasil_score, catatan, keputusan } = req.body; // keputusan = 'ACCEPTED' | 'REJECTED'

    const result = await prisma.$transaction(async (tx) => {
      // 1. Simpan nilai ke tabel Interview
      const interview = await tx.interview.update({
        where: { pendaftaran_id: parseInt(id) },
        data: {
          hasil_score: parseFloat(hasil_score),
          catatan
        }
      });

      // 2. Ubah status pendaftaran menjadi keputusan akhir (Lulus / Tidak Lulus)
      const pendaftaran = await tx.pendaftaran.update({
        where: { id: parseInt(id) },
        data: { status: keputusan }
      });

      return { interview, pendaftaran };
    });

    res.json({ message: 'Penilaian berhasil disimpan', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menyimpan penilaian', error: error.message });
  }
};
