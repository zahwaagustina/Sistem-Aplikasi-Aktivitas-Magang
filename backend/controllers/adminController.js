import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get Admin Statistics
export const getAdminStats = async (req, res) => {
  try {
    // Total users by role
    const totalMagang = await prisma.user.count({ where: { role: 'MAGANG' } });
    const totalPembimbing = await prisma.user.count({ where: { role: 'MENTOR' } });

    // Today's activities
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const aktivitasHariIni = await prisma.aktivitasHarian.count({
      where: {
        tanggal: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Pending review
    const pendingReview = await prisma.aktivitasHarian.count({
      where: { status: 'TERKIRIM' }
    });

    // Recent activities (5 latest)
    const recentAktivitas = await prisma.aktivitasHarian.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: { nama: true, universitas: true }
        }
      }
    });

    res.status(200).json({
      data: {
        totalMagang,
        totalPembimbing,
        aktivitasHariIni,
        pendingReview,
        recentAktivitas
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil statistik admin', error: error.message });
  }
};

// Get Dashboard Analytics untuk Chart
export const getDashboardAnalytics = async (req, res) => {
  try {
    const totalKandidat = await prisma.user.count({ where: { role: 'KANDIDAT' } });
    const totalPeserta = await prisma.user.count({ where: { role: 'MAGANG' } });
    const totalMentor = await prisma.user.count({ where: { role: 'MENTOR' } });
    const totalLowongan = await prisma.lowongan.count();

    const totalPendaftar = await prisma.pendaftaran.count();
    const lolosScreening = await prisma.pendaftaran.count({
      where: { status: { in: ['SHORTLISTED', 'ACCEPTED'] } }
    });
    
    // Aggregate by Divisi
    const divisiGroups = await prisma.profilMagang.groupBy({
      by: ['divisi'],
      _count: { id: true },
      where: { status: 'AKTIF' }
    });

    const divisiData = divisiGroups.map(d => ({
      name: d.divisi || 'Belum Ditempatkan',
      value: d._count.id
    }));

    res.status(200).json({
      data: {
        overview: {
          kandidat: totalKandidat,
          pesertaAktif: totalPeserta,
          mentor: totalMentor,
          lowonganAktif: totalLowongan
        },
        funnelData: [
          { name: 'Pendaftar', value: totalPendaftar },
          { name: 'Lolos Screening', value: lolosScreening },
          { name: 'Diterima Magang', value: totalPeserta }
        ],
        divisiData: divisiData.length > 0 ? divisiData : [{ name: 'Belum Ada', value: 0 }]
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data analitik', error: error.message });
  }
};

// Get Audit Logs
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditTrail.findMany({
      orderBy: { created_at: 'desc' },
      take: 100, // Ambil 100 log terbaru untuk performa
      include: {
        user: { select: { nama: true, email: true, role: true } }
      }
    });
    res.status(200).json({ data: logs });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil log audit', error: error.message });
  }
};

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['MAGANG', 'MENTOR'] }
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        email: true,
        created_at: true,
        profilMagang: {
          select: {
            universitas: true,
            jurusan: true,
            tanggal_selesai: true,
            id_magang: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Map the users to flatten profilMagang for frontend
    const mappedUsers = users.map(user => {
      const { profilMagang, ...rest } = user;
      return {
        ...rest,
        ...(profilMagang || {})
      };
    });

    res.status(200).json({ data: mappedUsers });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
  }
};

// Create New User (Admin Only)
export const createUser = async (req, res) => {
  try {
    const { 
      nama, 
      password, 
      role, 
      email, 
      universitas, 
      jurusan, 
      tanggal_selesai
    } = req.body;

    const username = email;

    // Check if username (email) exists
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let generated_id_magang = null;
    if (role === 'MAGANG') {
      const lastMagang = await prisma.user.findFirst({
        where: { role: 'MAGANG', id_magang: { not: null } },
        orderBy: { id_magang: 'desc' }
      });
      
      let nextNumber = 1;
      if (lastMagang && lastMagang.id_magang) {
        const parts = lastMagang.id_magang.split('-');
        if (parts.length === 2 && !isNaN(parts[1])) {
          nextNumber = parseInt(parts[1], 10) + 1;
        }
      }
      generated_id_magang = `MAG-${nextNumber.toString().padStart(3, '0')}`;
    }

    // Create user
    const newUser = await prisma.user.create({
      data: {
        nama,
        username,
        password: hashedPassword,
        role,
        email: email || null,
        ...(role === 'MAGANG' ? {
          profilMagang: {
            create: {
              id_magang: generated_id_magang,
              universitas: universitas || null,
              jurusan: jurusan || null,
              tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null
            }
          }
        } : {})
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        profilMagang: true
      }
    });

    res.status(201).json({ message: 'Pengguna berhasil ditambahkan', data: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan pengguna', error: error.message });
  }
};

// Update User (Admin Only)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      nama, 
      password, 
      role, 
      email, 
      universitas, 
      jurusan, 
      tanggal_selesai 
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!existingUser) {
      return res.status(404).json({ message: 'Pengguna tidak ditemukan' });
    }

    const username = email;

    // Check if new username exists for someone else
    if (username && username !== existingUser.username) {
      const usernameExists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Email sudah digunakan oleh pengguna lain' });
      }
    }

    const updateData = {
      nama,
      ...(username ? { username } : {}),
      role,
      email: email || null,
    };

    // If password provided, update it
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    let generated_id_magang = null;
    // Handle ID Magang generation if role changed to MAGANG
    if (role === 'MAGANG') {
      const profilMagangExisting = await prisma.profilMagang.findUnique({ where: { user_id: parseInt(id) } });
      if (!profilMagangExisting || !profilMagangExisting.id_magang) {
        const lastMagang = await prisma.user.findFirst({
          where: { role: 'MAGANG' },
          include: { profilMagang: true },
          orderBy: { created_at: 'desc' }
        });
        
        let nextNumber = 1;
        if (lastMagang && lastMagang.profilMagang && lastMagang.profilMagang.id_magang) {
          const parts = lastMagang.profilMagang.id_magang.split('-');
          if (parts.length === 2 && !isNaN(parts[1])) {
            nextNumber = parseInt(parts[1], 10) + 1;
          }
        }
        generated_id_magang = `MAG-${nextNumber.toString().padStart(3, '0')}`;
      }
      
      updateData.profilMagang = {
        upsert: {
          create: {
            id_magang: profilMagangExisting?.id_magang || generated_id_magang,
            universitas: universitas || null,
            jurusan: jurusan || null,
            tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null
          },
          update: {
            universitas: universitas || null,
            jurusan: jurusan || null,
            tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null
          }
        }
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        profilMagang: true
      }
    });

    res.status(200).json({ message: 'Pengguna berhasil diperbarui', data: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Gagal memperbarui pengguna', error: error.message });
  }
};

// Delete User (Admin Only)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak dapat menghapus akun Anda sendiri' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pengguna', error: error.message });
  }
};
