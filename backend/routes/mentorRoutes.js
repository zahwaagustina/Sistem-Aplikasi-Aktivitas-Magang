import express from 'express';
import { 
  getAnakMagang, 
  getDetailAnakMagang, 
  submitEvaluasi,
  approveLogbook,
  createTugas,
  deleteTugas,
  reviewTugas
} from '../controllers/mentorController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['MENTOR', 'SUPER_ADMIN']));

// Ambil daftar anak bimbingan
router.get('/anak-magang', getAnakMagang);

// Ambil detail profil, logbook, dan task dari satu anak bimbingan
router.get('/anak-magang/:id', getDetailAnakMagang);

// Submit form evaluasi anak magang
router.post('/anak-magang/:id/evaluasi', submitEvaluasi);

// Approve logbook
router.put('/logbook/:id/approve', approveLogbook);

// Manajemen Tugas
router.post('/tugas', createTugas);
router.delete('/tugas/:id', deleteTugas);
router.put('/tugas/:id/review', upload.fields([{ name: 'file_feedback', maxCount: 1 }]), reviewTugas);

export default router;
