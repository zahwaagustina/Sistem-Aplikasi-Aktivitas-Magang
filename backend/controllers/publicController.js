import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Get list of active Lowongan
export const getLowongan = async (req, res) => {
  try {
    const lowongan = await prisma.lowongan.findMany({
      where: { status: 'OPEN', program: { is_active: true } },
      include: {
        program: { select: { nama: true, tanggal_mulai: true, tanggal_selesai: true } }
      },
      orderBy: { created_at: 'desc' }
    });
    res.json({ data: lowongan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data lowongan', error: error.message });
  }
};

// Get single Lowongan by ID
export const getLowonganById = async (req, res) => {
  try {
    const { id } = req.params;
    const lowongan = await prisma.lowongan.findUnique({
      where: { id: parseInt(id) },
      include: {
        program: { select: { nama: true, tanggal_mulai: true, tanggal_selesai: true } }
      }
    });
    
    if (!lowongan) {
      return res.status(404).json({ message: 'Lowongan tidak ditemukan' });
    }
    
    res.json({ data: lowongan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil detail lowongan', error: error.message });
  }
};

// Register Kandidat
export const registerKandidat = async (req, res) => {
  const { nama, email, username, password, no_telepon } = req.body;
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email atau username sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        username,
        password: hashedPassword,
        no_telepon,
        role: 'KANDIDAT',
        profilKandidat: {
          create: {} // ProfilKandidat created empty, will be filled during Apply
        }
      }
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'Pendaftaran akun berhasil.', 
      data: newUser.username,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        nama: newUser.nama
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
