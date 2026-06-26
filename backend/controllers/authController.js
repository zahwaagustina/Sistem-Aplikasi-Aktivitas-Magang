import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/validation.js';
import { sendPasswordResetEmail } from '../utils/mailer.js';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    const existingUser = await prisma.user.findUnique({
      where: { username: validatedData.username }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah terdaftar' });
    }

    // Tentukan role berdasarkan akhiran username
    let role = null;
    const username = validatedData.username.toLowerCase();
    if (username.endsWith('.magang')) {
      role = 'MAGANG';
    } else if (username.endsWith('.pembimbing')) {
      role = 'PEMBIMBING';
    } else if (username.endsWith('.admin')) {
      role = 'ADMIN';
    } else {
      return res.status(400).json({ message: 'Format username tidak valid. Harus diakhiri dengan .magang, .pembimbing, atau .admin' });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    let id_magang = null;
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
      id_magang = `MAG-${nextNumber.toString().padStart(3, '0')}`;
    }

    const user = await prisma.user.create({
      data: {
        nama: validatedData.nama,
        username: validatedData.username,
        password: hashedPassword,
        role: role,
        divisi: validatedData.divisi,
        id_magang: id_magang
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil', data: { id: user.id, username: user.username } });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { 
        OR: [
          { username: validatedData.username },
          { email: validatedData.username }
        ]
      },
      include: { profilMagang: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username/Email atau password salah' });
    }

    if (user.role === 'KANDIDAT' && user.is_verified === false) {
      return res.status(403).json({ 
        message: 'Email belum diverifikasi. Silakan periksa email Anda (termasuk folder Spam) untuk link verifikasi.' 
      });
    }

    const validPassword = await bcrypt.compare(validatedData.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        role: user.role,
        divisi: user.divisi,
        nickname: user.nickname,
        semester: user.semester,
        universitas: user.universitas,
        jurusan: user.jurusan,
        angkatan: user.angkatan,
        email: user.email,
        mentor: user.mentor,
        perusahaan: user.perusahaan,
        lokasi: user.lokasi,
        tanggal_selesai: user.tanggal_selesai,
        no_telepon: user.no_telepon,
        id_magang: user.id_magang,
        surat_keterangan: user.surat_keterangan,
        status: user.profilMagang?.status || null
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Token verifikasi tidak disediakan' });
    }

    const user = await prisma.user.findFirst({
      where: {
        verification_token: token,
        verification_expires: {
          gt: new Date() // pastikan token belum kedaluwarsa
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Token tidak valid atau sudah kedaluwarsa' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_expires: null
      }
    });

    res.status(200).json({ message: 'Email berhasil diverifikasi! Silakan login.' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi' });
    }

    const user = await prisma.user.findFirst({
      where: { email: email }
    });

    if (!user) {
      return res.status(404).json({ message: 'Email tidak ditemukan.' });
    }

    // Buat token random
    const token = crypto.randomBytes(32).toString('hex');
    
    // Masa berlaku 60 menit
    const expiredAt = new Date(Date.now() + 60 * 60 * 1000);

    // Simpan token ke database
    await prisma.passwordResetToken.create({
      data: {
        user_id: user.id,
        email: user.email,
        token: token,
        expired_at: expiredAt
      }
    });

    // Kirim email
    const emailSent = await sendPasswordResetEmail(user.email, token);

    if (!emailSent) {
      return res.status(500).json({ message: 'Gagal mengirim email reset password.' });
    }

    res.status(200).json({ message: 'Link reset password telah dikirim ke email Anda.' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token dan password baru wajib diisi' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    // Cek token di database
    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: token }
    });

    if (!resetTokenRecord || resetTokenRecord.expired_at < new Date()) {
      return res.status(400).json({ message: 'Link reset password tidak valid atau telah kedaluwarsa.' });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password user
    await prisma.user.update({
      where: { id: resetTokenRecord.user_id },
      data: { password: hashedPassword }
    });

    // Hapus token yang sudah digunakan
    await prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id }
    });

    res.status(200).json({ message: 'Password berhasil diubah. Silakan login menggunakan password baru.' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan pada server', error: error.message });
  }
};
