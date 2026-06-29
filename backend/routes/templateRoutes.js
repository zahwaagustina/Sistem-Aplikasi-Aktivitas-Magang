import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { uploadTemplate } from '../middleware/uploadTemplate.js';
import {
  getAllTemplates,
  getActiveTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleStatusTemplate,
  downloadTemplate
} from '../controllers/templateController.js';

const router = express.Router();

// Middleware auth untuk semua route
router.use(authenticateToken);

// --- Routes untuk MAGANG ---
// Mengambil semua template yang aktif
router.get('/active', authorizeRole(['MAGANG']), getActiveTemplates);

// --- Routes untuk ADMIN (SUPER_ADMIN) ---
// Mengambil semua template
router.get('/', authorizeRole(['SUPER_ADMIN']), getAllTemplates);

// Tambah template baru
router.post('/', authorizeRole(['SUPER_ADMIN']), uploadTemplate.single('file'), createTemplate);

// Update template (termasuk file)
router.put('/:id', authorizeRole(['SUPER_ADMIN']), uploadTemplate.single('file'), updateTemplate);

// Hapus template
router.delete('/:id', authorizeRole(['SUPER_ADMIN']), deleteTemplate);

// Toggle status template
router.patch('/:id/status', authorizeRole(['SUPER_ADMIN']), toggleStatusTemplate);

// --- Routes Umum ---
// Download template
router.get('/download/:id', downloadTemplate);

export default router;
