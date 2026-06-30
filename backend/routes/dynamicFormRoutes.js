import express from 'express';
import {
  getForms,
  getFormById,
  createForm,
  updateForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  getActiveKesanggupanForm,
  submitKesanggupanForm,
  getKesanggupanResponses,
  exportKesanggupan
} from '../controllers/dynamicFormController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// ==========================================
// ADMIN ROUTES (Manajemen Form)
// ==========================================

// Middleware untuk membatasi akses hanya untuk Admin/HR
const adminMiddleware = [authenticateToken, authorizeRole('SUPER_ADMIN', 'MANAJEMEN', 'UNIT')]; // Sesuaikan dengan role yang berhak

router.get('/admin/forms', adminMiddleware, getForms);
router.post('/admin/forms', adminMiddleware, createForm);
router.get('/admin/forms/:id', adminMiddleware, getFormById);
router.put('/admin/forms/:id', adminMiddleware, updateForm);
router.delete('/admin/forms/:id', adminMiddleware, deleteForm);

router.post('/admin/forms/:formId/questions', adminMiddleware, createQuestion);
router.put('/admin/questions/:questionId', adminMiddleware, updateQuestion);
router.delete('/admin/questions/:questionId', adminMiddleware, deleteQuestion);
router.put('/admin/forms/:formId/questions/reorder', adminMiddleware, reorderQuestions);

router.get('/admin/responses/export', adminMiddleware, exportKesanggupan);
router.get('/admin/responses', adminMiddleware, getKesanggupanResponses);

// ==========================================
// KANDIDAT ROUTES (Mengisi Form)
// ==========================================

router.get('/kandidat/active', authenticateToken, authorizeRole('KANDIDAT', 'MAGANG'), getActiveKesanggupanForm);
router.post('/kandidat/submit/:pendaftaranId', authenticateToken, authorizeRole('KANDIDAT', 'MAGANG'), submitKesanggupanForm);

export default router;
