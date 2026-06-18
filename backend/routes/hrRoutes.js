import express from 'express';
import { 
  getDaftarKandidat, 
  updateStatusLamaran, 
  scheduleInterview, 
  submitNilaiInterview,
  getMentors,
  getProgramBatch,
  getLowonganHR,
  createLowonganHR,
  updateLowonganHR,
  deleteLowonganHR
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
router.get('/mentors', getMentors);

// Rute Manajemen Lowongan
router.get('/program-batch', getProgramBatch);
router.get('/lowongan', getLowonganHR);
router.post('/lowongan', createLowonganHR);
router.put('/lowongan/:id', updateLowonganHR);
router.delete('/lowongan/:id', deleteLowonganHR);

export default router;
