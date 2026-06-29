import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '..');

// [Admin] Get all templates
export const getAllTemplates = async (req, res) => {
  try {
    const templates = await prisma.masterTemplate.findMany({
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data template.' });
  }
};

// [Magang] Get active templates only
export const getActiveTemplates = async (req, res) => {
  try {
    const templates = await prisma.masterTemplate.findMany({
      where: { status: true },
      orderBy: { created_at: 'desc' }
    });
    res.json({ success: true, data: templates });
  } catch (error) {
    console.error('Error fetching active templates:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data template aktif.' });
  }
};

// [Admin] Create a template
export const createTemplate = async (req, res) => {
  try {
    const { nama_template, deskripsi } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File template harus diunggah.' });
    }

    const newTemplate = await prisma.masterTemplate.create({
      data: {
        nama_template,
        deskripsi: deskripsi || null,
        nama_file: req.file.originalname,
        path_file: req.file.path.replace(/\\/g, '/'),
        ekstensi: req.file.originalname.substring(req.file.originalname.lastIndexOf('.')).toLowerCase(),
        ukuran_file: req.file.size,
        created_by: req.user.id
      }
    });

    res.status(201).json({ success: true, message: 'Template berhasil ditambahkan.', data: newTemplate });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan template.' });
  }
};

// [Admin] Update a template
export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama_template, deskripsi } = req.body;

    const existingTemplate = await prisma.masterTemplate.findUnique({ where: { id: Number(id) } });
    if (!existingTemplate) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan' });
    }

    const dataToUpdate = {
      nama_template,
      deskripsi: deskripsi || null,
    };

    if (req.file) {
      // Delete old file if exists
      if (existingTemplate.path_file) {
        const oldPath = path.join(backendRoot, existingTemplate.path_file);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      dataToUpdate.nama_file = req.file.originalname;
      dataToUpdate.path_file = req.file.path.replace(/\\/g, '/');
      dataToUpdate.ekstensi = path.extname(req.file.originalname).toLowerCase();
      dataToUpdate.ukuran_file = req.file.size;
    }

    const updatedTemplate = await prisma.masterTemplate.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Template berhasil diperbarui.', data: updatedTemplate });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui template.' });
  }
};

// [Admin] Delete a template
export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const existingTemplate = await prisma.masterTemplate.findUnique({ where: { id: Number(id) } });
    
    if (!existingTemplate) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
    }

    // Delete file
    if (existingTemplate.path_file) {
      const filePath = path.join(backendRoot, existingTemplate.path_file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.masterTemplate.delete({ where: { id: Number(id) } });

    res.json({ success: true, message: 'Template berhasil dihapus.' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus template.' });
  }
};

// [Admin] Toggle status
export const toggleStatusTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingTemplate = await prisma.masterTemplate.findUnique({ where: { id: Number(id) } });
    if (!existingTemplate) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
    }

    const updatedTemplate = await prisma.masterTemplate.update({
      where: { id: Number(id) },
      data: { status: !existingTemplate.status }
    });

    res.json({ success: true, message: `Status template berhasil diubah menjadi ${updatedTemplate.status ? 'Aktif' : 'Tidak Aktif'}.`, data: updatedTemplate });
  } catch (error) {
    console.error('Error toggling template status:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status template.' });
  }
};

// [All] Download template file
export const downloadTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await prisma.masterTemplate.findUnique({ where: { id: Number(id) } });
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template tidak ditemukan.' });
    }

    const filePath = path.join(backendRoot, template.path_file);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'File tidak ditemukan di server.' });
    }

    res.download(filePath, template.nama_file);
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ success: false, message: 'Gagal mengunduh template.' });
  }
};
