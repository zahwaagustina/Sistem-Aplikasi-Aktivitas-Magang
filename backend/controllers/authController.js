import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/validation.js';

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

    const user = await prisma.user.findUnique({
      where: { username: validatedData.username }
    });

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
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
        id_magang: user.id_magang
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validasi gagal', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
