import express from 'express';
import { 
  getAnakMagang, 
  getDetailAnakMagang, 
  submitEvaluasi,
  approveLogbook
} from '../controllers/mentorController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

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

export default router;
