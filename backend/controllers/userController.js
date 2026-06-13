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
        id_magang: true
      }
    });

    res.status(200).json({ message: 'Profil berhasil diperbarui', data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
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
        id_magang: true
      }
    });
    res.status(200).json({ data: magangUsers });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data anak magang', error: error.message });
  }
};
