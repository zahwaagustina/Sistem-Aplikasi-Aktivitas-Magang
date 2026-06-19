import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
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

    // Update the base User table
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        nama,
        email,
        no_telepon,
      }
    });

    // Handle ProfilMagang update if the user is a MAGANG
    if (req.user.role === 'MAGANG') {
      await prisma.profilMagang.upsert({
        where: { user_id: userId },
        update: {
          universitas,
          jurusan,
          angkatan,
          semester,
          lokasi,
          tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null,
          // nickname, perusahaan, and mentor are not in ProfilMagang schema natively yet, 
          // or we can just save the ones that exist in ProfilMagang
        },
        create: {
          user_id: userId,
          universitas,
          jurusan,
          angkatan,
          semester,
          lokasi,
          tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null,
        }
      });
    }

    // Refetch the full user profile to return
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilMagang: true
      }
    });

    // Format the response to match what the frontend expects
    const responseData = {
      ...fullUser,
      ...fullUser.profilMagang,
    };

    res.status(200).json({ message: 'Profil berhasil diperbarui', data: responseData });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: 'Gagal memperbarui profil', error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profilMagang: true,
        profilKandidat: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Gabungkan data dari profil terkait sesuai dengan role-nya
    let profileData = {};
    if (user.role === 'MAGANG' && user.profilMagang) {
      profileData = user.profilMagang;
    } else if (user.role === 'KANDIDAT' && user.profilKandidat) {
      profileData = user.profilKandidat;
    }

    // Hilangkan relasi utuh dari object response agar rapi
    const { password, profilMagang, profilKandidat, ...baseUser } = user;
    
    const responseData = {
      ...baseUser,
      ...profileData
    };

    res.status(200).json({ data: responseData });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: 'Gagal mengambil profil', error: error.message });
  }
};

export const getMagangUsers = async (req, res) => {
  try {
    const magangUsers = await prisma.user.findMany({
      where: { role: 'MAGANG' },
      include: {
        profilMagang: true
      }
    });

    const formattedUsers = magangUsers.map(user => {
      const { password, profilMagang, ...baseUser } = user;
      return {
        ...baseUser,
        ...(profilMagang || {})
      };
    });

    res.status(200).json({ data: formattedUsers });
  } catch (error) {
    console.error("Get magang users error:", error);
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

    // Surat Keterangan is usually a Dokumen type now
    // We create a Dokumen entry for it
    await prisma.dokumen.create({
      data: {
        user_id: parseInt(id),
        tipe: 'SURAT_KETERANGAN',
        nama_file: req.file.originalname,
        file_path: suratPath
      }
    });

    res.status(200).json({ 
      message: 'Surat Keterangan berhasil diunggah', 
      surat_keterangan: suratPath 
    });
  } catch (error) {
    console.error("Upload surat error:", error);
    res.status(500).json({ message: 'Gagal mengunggah surat keterangan', error: error.message });
  }
};
