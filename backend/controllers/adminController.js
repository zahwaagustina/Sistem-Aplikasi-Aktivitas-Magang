import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Get Admin Statistics
export const getAdminStats = async (req, res) => {
  try {
    // Total users by role
    const totalMagang = await prisma.user.count({ where: { role: 'MAGANG' } });
    const totalPembimbing = await prisma.user.count({ where: { role: 'PEMBIMBING' } });

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

// Get All Users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: { in: ['MAGANG', 'PEMBIMBING'] }
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        email: true,
        universitas: true,
        jurusan: true,
        tanggal_selesai: true,
        id_magang: true,
        created_at: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pengguna', error: error.message });
  }
};

// Create New User (Admin Only)
export const createUser = async (req, res) => {
  try {
    const { 
      nama, 
      username, 
      password, 
      role, 
      email, 
      universitas, 
      jurusan, 
      tanggal_selesai
    } = req.body;

    // Check if username exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
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
        universitas: universitas || null,
        jurusan: jurusan || null,
        tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null,
        id_magang: generated_id_magang
      },
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        id_magang: true
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
      username, 
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

    // Check if new username exists for someone else
    if (username !== existingUser.username) {
      const usernameExists = await prisma.user.findUnique({ where: { username } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username sudah digunakan oleh pengguna lain' });
      }
    }

    const updateData = {
      nama,
      username,
      role,
      email: email || null,
      universitas: universitas || null,
      jurusan: jurusan || null,
      tanggal_selesai: tanggal_selesai ? new Date(tanggal_selesai) : null
    };

    // If password provided, update it
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Handle ID Magang generation if role changed to MAGANG
    if (role === 'MAGANG' && existingUser.role !== 'MAGANG' && !existingUser.id_magang) {
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
      updateData.id_magang = `MAG-${nextNumber.toString().padStart(3, '0')}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        nama: true,
        username: true,
        role: true,
        id_magang: true
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
