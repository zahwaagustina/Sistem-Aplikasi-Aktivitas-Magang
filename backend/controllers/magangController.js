import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ========================
// ABSENSI
// ========================

export const getRiwayatAbsensi = async (req, res) => {
  try {
    const user_id = req.user.id;
    const absensi = await prisma.absensi.findMany({
      where: { user_id },
      orderBy: { tanggal: 'desc' }
    });
    res.json({ data: absensi });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { lokasi } = req.body;
    
    // Use local date explicitly to avoid UTC offset issues saving yesterday's date
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const nowWIB = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
    if (nowWIB.getHours() > 12 || (nowWIB.getHours() === 12 && nowWIB.getMinutes() > 0)) {
      return res.status(400).json({ message: 'Batas waktu check-in (12:00 WIB) telah terlewati' });
    }
    
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        user_id,
        tanggal: today
      }
    });

    if (existingAbsensi) {
      return res.status(400).json({ message: 'Anda sudah melakukan absensi hari ini' });
    }

    const absensi = await prisma.absensi.create({
      data: {
        user_id,
        tanggal: today,
        waktu_masuk: new Date(),
        lokasi_masuk: lokasi,
        status: 'HADIR'
      }
    });

    res.status(201).json({ message: 'Check-in berhasil', data: absensi });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { lokasi } = req.body;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const today = new Date(`${year}-${month}-${day}T00:00:00.000Z`);

    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        user_id,
        tanggal: today
      }
    });

    if (!existingAbsensi) {
      return res.status(400).json({ message: 'Anda belum melakukan check-in hari ini' });
    }

    if (existingAbsensi.waktu_keluar) {
      return res.status(400).json({ message: 'Anda sudah melakukan check-out hari ini' });
    }

    const absensi = await prisma.absensi.update({
      where: { id: existingAbsensi.id },
      data: {
        waktu_keluar: new Date(),
        lokasi_keluar: lokasi
      }
    });

    res.json({ message: 'Check-out berhasil', data: absensi });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

export const ajukanIzin = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { tanggal, tipe, keterangan } = req.body;
    
    if (!['IZIN', 'SAKIT'].includes(tipe)) {
      return res.status(400).json({ message: 'Tipe pengajuan tidak valid' });
    }

    const files = req.files;
    let bukti_path = null;

    if (files && files['bukti'] && files['bukti'].length > 0) {
      bukti_path = '/uploads/' + files['bukti'][0].filename;
    }

    // Validasi wajib upload bukti untuk SAKIT
    if (tipe === 'SAKIT' && !bukti_path) {
      return res.status(400).json({ message: 'Surat Keterangan Dokter wajib diunggah untuk pengajuan Sakit' });
    }

    const tgl = new Date(tanggal);

    // Cek apakah sudah ada absen/pengajuan di tanggal tersebut
    const existingAbsensi = await prisma.absensi.findFirst({
      where: {
        user_id,
        tanggal: tgl
      }
    });

    if (existingAbsensi) {
      return res.status(400).json({ message: 'Anda sudah melakukan absensi atau pengajuan pada tanggal tersebut' });
    }

    const absensi = await prisma.absensi.create({
      data: {
        user_id,
        tanggal: tgl,
        status: tipe,
        keterangan,
        bukti_path
      }
    });

    res.status(201).json({ message: `Pengajuan ${tipe} berhasil dikirim`, data: absensi });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};

// ========================
// LOGBOOK (Aktivitas Harian)
// ========================

export const getLogbook = async (req, res) => {
  try {
    const user_id = req.user.id;
    const aktivitas = await prisma.aktivitasHarian.findMany({
      where: { user_id },
      include: { lampiran: true },
      orderBy: { tanggal: 'desc' }
    });
    res.json({ data: aktivitas });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const createLogbook = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { tanggal, deskripsi_kegiatan, hasil_kegiatan, waktu_mulai, waktu_selesai, kendala } = req.body;

    const logDate = new Date(tanggal);
    const today = new Date();
    logDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    if (logDate > today) {
      return res.status(400).json({ message: 'Tidak dapat mengisi logbook untuk hari kedepan' });
    }

    const files = req.files;

    const result = await prisma.$transaction(async (tx) => {
      const aktivitas = await tx.aktivitasHarian.create({
        data: {
          user_id,
          tanggal: new Date(tanggal),
          deskripsi_kegiatan,
          hasil_kegiatan,
          waktu_mulai,
          waktu_selesai,
          kendala,
          status: 'TERKIRIM' // Langsung terkirim untuk direview mentor
        }
      });

      if (files && files.lampiran) {
        const lampiranData = files.lampiran.map(file => ({
          aktivitas_id: aktivitas.id,
          nama_file: file.originalname,
          file_path: '/uploads/' + file.filename
        }));
        await tx.lampiran.createMany({ data: lampiranData });
      }

      return aktivitas;
    });

    // Notify Mentor
    const profilMagang = await prisma.profilMagang.findUnique({ where: { user_id } });
    if (profilMagang && profilMagang.mentor_id) {
      await prisma.notifikasi.create({
        data: {
          user_id: profilMagang.mentor_id,
          judul: 'Logbook Baru Terkirim',
          pesan: `Peserta magang telah mengirimkan logbook untuk tanggal ${new Date(tanggal).toLocaleDateString('id-ID')} untuk direview.`,
        }
      });
    }

    res.status(201).json({ message: 'Logbook berhasil disimpan', data: result });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// ========================
// TUGAS (Kanban)
// ========================

export const getTugas = async (req, res) => {
  try {
    const user_id = req.user.id;
    const tugas = await prisma.tugas.findMany({
      where: { peserta_id: user_id },
      include: {
        mentor: { select: { nama: true } }
      },
      orderBy: { deadline: 'asc' }
    });
    res.json({ data: tugas });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const submitTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const files = req.files;
    let file_hasil = null;

    if (files && files.file_hasil && files.file_hasil.length > 0) {
      file_hasil = '/uploads/' + files.file_hasil[0].filename;
    }

    const tugas = await prisma.tugas.findFirst({
      where: { id: parseInt(id), peserta_id: user_id },
      include: { peserta: { select: { nama: true } } }
    });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    const updatedTugas = await prisma.tugas.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REVIEW',
        file_hasil: file_hasil || tugas.file_hasil
      }
    });

    await prisma.notifikasi.create({
      data: {
        user_id: tugas.mentor_id,
        judul: 'Tugas Dikumpulkan',
        pesan: `Peserta ${tugas.peserta?.nama || 'Magang'} telah mengumpulkan tugas "${tugas.judul}" dan menunggu review Anda.`,
        link: `/mentor/profil-magang?userId=${user_id}&tab=tugas`
      }
    });

    res.json({ message: 'Tugas berhasil disubmit', data: updatedTugas });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const updateStatusTugas = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const { status } = req.body;

    const tugas = await prisma.tugas.findFirst({
      where: { id: parseInt(id), peserta_id: user_id }
    });

    if (!tugas) {
      return res.status(404).json({ message: 'Tugas tidak ditemukan' });
    }

    const updatedTugas = await prisma.tugas.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // Kirim notifikasi jika statusnya DONE (di-review mentor)
    if (status === 'DONE') {
      await prisma.notifikasi.create({
        data: {
          user_id: tugas.peserta_id,
          judul: 'Tugas Disetujui',
          pesan: `Tugas "${tugas.judul}" telah disetujui oleh Mentor.`
        }
      });
    }

    res.json({ message: 'Status tugas diperbarui', data: updatedTugas });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
