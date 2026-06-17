import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Kandidat melamar lowongan
export const applyLowongan = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { lowongan_id, universitas, jurusan, angkatan, semester } = req.body;
    
    // Pastikan user memiliki profilKandidat
    const profil = await prisma.profilKandidat.findUnique({ where: { user_id } });
    if (!profil) {
      return res.status(400).json({ message: 'Profil Kandidat tidak ditemukan' });
    }

    // Update Profil Kandidat dengan data akademik
    await prisma.profilKandidat.update({
      where: { user_id },
      data: {
        universitas: universitas || profil.universitas,
        jurusan: jurusan || profil.jurusan,
        angkatan: angkatan || profil.angkatan,
        semester: semester || profil.semester
      }
    });

    // Pastikan lowongan tersedia
    const lowongan = await prisma.lowongan.findUnique({ where: { id: parseInt(lowongan_id) } });
    if (!lowongan || lowongan.status !== 'OPEN') {
      return res.status(404).json({ message: 'Lowongan tidak tersedia' });
    }

    // Cek apakah sudah melamar di lowongan ini
    const existingPendaftaran = await prisma.pendaftaran.findFirst({
      where: { user_id, lowongan_id: parseInt(lowongan_id) }
    });
    if (existingPendaftaran) {
      return res.status(400).json({ message: 'Anda sudah melamar posisi ini' });
    }

    // Handle file uploads (CV, KTP, Transkrip)
    const files = req.files;
    let cv_path = profil.cv_path;
    let surat_pengantar = null;

    if (files) {
      if (files['cv'] && files['cv'].length > 0) {
        cv_path = '/uploads/' + files['cv'][0].filename;
        // Update CV di profil
        await prisma.profilKandidat.update({
          where: { user_id },
          data: { cv_path }
        });
      }
      if (files['surat_pengantar'] && files['surat_pengantar'].length > 0) {
        surat_pengantar = '/uploads/' + files['surat_pengantar'][0].filename;
      }
      if (files['transkrip'] && files['transkrip'].length > 0) {
        await prisma.dokumen.create({
          data: {
            user_id,
            tipe: 'TRANSKRIP',
            nama_file: files['transkrip'][0].originalname,
            file_path: '/uploads/' + files['transkrip'][0].filename
          }
        });
      }
      if (files['ktp'] && files['ktp'].length > 0) {
        await prisma.dokumen.create({
          data: {
            user_id,
            tipe: 'KTP',
            nama_file: files['ktp'][0].originalname,
            file_path: '/uploads/' + files['ktp'][0].filename
          }
        });
      }
    }

    // Jika KTP/Transkrip belum ada, seharusnya divalidasi di frontend, kita asumsikan sudah lolos validasi.
    
    // Buat Pendaftaran
    const pendaftaran = await prisma.pendaftaran.create({
      data: {
        user_id,
        lowongan_id: parseInt(lowongan_id),
        surat_pengantar,
        status: 'SUBMITTED'
      }
    });

    res.status(201).json({ message: 'Berhasil melamar lowongan', data: pendaftaran });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

// Mendapatkan status lamaran kandidat
export const getMyApplications = async (req, res) => {
  try {
    const user_id = req.user.id;
    const applications = await prisma.pendaftaran.findMany({
      where: { user_id },
      include: {
        lowongan: {
          include: { program: true }
        },
        interview: true
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: applications });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan', error: error.message });
  }
};
