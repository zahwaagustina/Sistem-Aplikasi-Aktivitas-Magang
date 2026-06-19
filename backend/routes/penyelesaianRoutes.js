import express from 'express';
import { uploadLaporan, getPenyelesaianStatus, generateSertifikat, uploadSertifikatManual } from '../controllers/penyelesaianController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer storage for Laporan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/laporan');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Bedakan nama file berdasarkan jenis dokumen
    const prefix = file.fieldname === 'sertifikat' ? 'sertifikat-' : 'laporan-';
    cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Rute untuk Peserta Magang
router.get('/magang/status', authenticateToken, authorizeRole('MAGANG'), getPenyelesaianStatus);
router.post('/magang/upload-laporan', authenticateToken, authorizeRole('MAGANG'), upload.single('laporan'), uploadLaporan);

// Rute untuk Mentor (Generate Sertifikat Otomatis - Opsional/Deprecated)
router.post('/mentor/generate-sertifikat/:userId', authenticateToken, authorizeRole('MENTOR', 'SUPER_ADMIN'), generateSertifikat);

// Rute untuk Mentor (Upload Sertifikat Manual)
router.post('/mentor/upload-sertifikat/:userId', authenticateToken, authorizeRole('MENTOR', 'SUPER_ADMIN'), upload.single('sertifikat'), uploadSertifikatManual);

export default router;
