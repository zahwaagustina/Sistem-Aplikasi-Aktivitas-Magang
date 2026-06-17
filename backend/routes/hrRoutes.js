import express from 'express';
import { 
  getDaftarKandidat, 
  updateStatusLamaran, 
  scheduleInterview, 
  submitNilaiInterview 
} from '../controllers/hrController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Hanya HR_ADMIN dan SUPER_ADMIN yang bisa mengakses
router.use(authenticateToken, authorizeRole(['HR_ADMIN', 'SUPER_ADMIN']));

// Rute Manajemen Kandidat & Seleksi
router.get('/kandidat', getDaftarKandidat);
router.put('/kandidat/:id/status', updateStatusLamaran);
router.post('/kandidat/:id/interview', scheduleInterview);
router.put('/kandidat/:id/interview', submitNilaiInterview);

export default router;
