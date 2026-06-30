import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/mailer.js';

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
  const { nama, email, password, no_telepon } = req.body;
  const username = email; // Set username sama dengan email karena field username dihapus
  try {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const newUser = await prisma.user.create({
      data: {
        nama,
        email,
        username,
        password: hashedPassword,
        no_telepon,
        role: 'KANDIDAT',
        is_verified: false,
        verification_token: verificationToken,
        verification_expires: verificationExpires,
        profilKandidat: {
          create: {} // ProfilKandidat created empty, will be filled during Apply
        }
      }
    });

    // Kirim email verifikasi
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ 
      message: 'Pendaftaran akun berhasil. Silakan cek email Anda untuk verifikasi sebelum login.', 
      data: newUser.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
