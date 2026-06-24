import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ASPEK PENILAIAN

export const getAspekPenilaian = async (req, res) => {
  try {
    const aspek = await prisma.aspekPenilaian.findMany({
      include: {
        pertanyaan: {
          where: { is_active: true }
        }
      },
      orderBy: { id: 'asc' }
    });
    res.json({ message: 'Berhasil mengambil data aspek', data: aspek });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data aspek', error: error.message });
  }
};

export const createAspekPenilaian = async (req, res) => {
  const { nama, bobot, is_active } = req.body;
  try {
    const aspek = await prisma.aspekPenilaian.create({
      data: { nama, bobot: parseFloat(bobot), is_active }
    });
    res.status(201).json({ message: 'Aspek berhasil ditambahkan', data: aspek });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan aspek', error: error.message });
  }
};

export const updateAspekPenilaian = async (req, res) => {
  const { id } = req.params;
  const { nama, bobot, is_active } = req.body;
  try {
    const aspek = await prisma.aspekPenilaian.update({
      where: { id: parseInt(id) },
      data: { nama, bobot: parseFloat(bobot), is_active }
    });
    res.json({ message: 'Aspek berhasil diubah', data: aspek });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah aspek', error: error.message });
  }
};

export const deleteAspekPenilaian = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.aspekPenilaian.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Aspek berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus aspek', error: error.message });
  }
};

// PERTANYAAN PENILAIAN

export const getPertanyaanPenilaian = async (req, res) => {
  try {
    const pertanyaan = await prisma.pertanyaanPenilaian.findMany({
      include: {
        aspek: true
      },
      orderBy: { id: 'asc' }
    });
    res.json({ message: 'Berhasil mengambil data pertanyaan', data: pertanyaan });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data pertanyaan', error: error.message });
  }
};

export const createPertanyaanPenilaian = async (req, res) => {
  const { aspek_id, pertanyaan, is_active } = req.body;
  try {
    const baru = await prisma.pertanyaanPenilaian.create({
      data: { 
        aspek_id: parseInt(aspek_id), 
        pertanyaan, 
        is_active 
      }
    });
    res.status(201).json({ message: 'Pertanyaan berhasil ditambahkan', data: baru });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan pertanyaan', error: error.message });
  }
};

export const updatePertanyaanPenilaian = async (req, res) => {
  const { id } = req.params;
  const { aspek_id, pertanyaan, is_active } = req.body;
  try {
    const diubah = await prisma.pertanyaanPenilaian.update({
      where: { id: parseInt(id) },
      data: { 
        aspek_id: parseInt(aspek_id), 
        pertanyaan, 
        is_active 
      }
    });
    res.json({ message: 'Pertanyaan berhasil diubah', data: diubah });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah pertanyaan', error: error.message });
  }
};

export const deletePertanyaanPenilaian = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.pertanyaanPenilaian.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: 'Pertanyaan berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus pertanyaan', error: error.message });
  }
};
