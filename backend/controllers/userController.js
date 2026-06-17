import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { 
      nama, 
      universitas, 
      jurusan, 
      angkatan, 
      email, 
      mentor, 
      perusahaan, 
      lokasi, 
      tanggal_selesai,
      nickname,
      semester,
      no_telepon
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        universitas,
        jurusan,
        angkatan,
        email,
        mentor,
        perusahaan,
        lokasi,
        tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null,
        nickname,
        semester,
        no_telepon
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        divisi: true,
        universitas: true,
        jurusan: true,
        angkatan: true,
        email: true,
        mentor: true,
        perusahaan: true,
        lokasi: true,
        tanggal_selesai: true,
        nickname: true,
        semester: true,
        no_telepon: true,
        id_magang: true,
        surat_keterangan: true
      }
    });

    res.status(200).json({ message: 'Profil berhasil diperbarui', data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        divisi: true,
        universitas: true,
        jurusan: true,
        angkatan: true,
        email: true,
        mentor: true,
        perusahaan: true,
        lokasi: true,
        tanggal_selesai: true,
        nickname: true,
        semester: true,
        no_telepon: true,
        id_magang: true,
        surat_keterangan: true
      }
    });
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message });
  }
};

export const getMagangUsers = async (req, res) => {
  try {
    const magangUsers = await prisma.user.findMany({
      where: { role: 'MAGANG' },
      select: {
        id: true,
        nama: true,
        username: true,
        divisi: true,
        universitas: true,
        jurusan: true,
        angkatan: true,
        email: true,
        mentor: true,
        perusahaan: true,
        lokasi: true,
        tanggal_selesai: true,
        nickname: true,
        semester: true,
        no_telepon: true,
        id_magang: true,
        surat_keterangan: true
      }
    });
    res.status(200).json({ data: magangUsers });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data anak magang', error: error.message });
  }
};

export const uploadSuratKeterangan = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    const suratPath = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        surat_keterangan: suratPath
      }
    });

    res.status(200).json({ 
      message: 'Surat Keterangan berhasil diunggah', 
      surat_keterangan: updatedUser.surat_keterangan 
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengunggah surat keterangan', error: error.message });
  }
};
