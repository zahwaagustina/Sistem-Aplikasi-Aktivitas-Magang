import express from 'express';
import { 
  getRiwayatAbsensi, 
  checkIn, 
  checkOut, 
  getLogbook, 
  createLogbook, 
  getTugas, 
  submitTugas, 
  updateStatusTugas 
} from '../controllers/magangController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Semua rute di bawah ini wajib login dan memiliki role MAGANG
router.use(authenticateToken, authorizeRole(['MAGANG']));

// Rute Absensi
router.get('/absensi', getRiwayatAbsensi);
router.post('/absensi/checkin', checkIn);
router.post('/absensi/checkout', checkOut);

// Rute Logbook
router.get('/logbook', getLogbook);
router.post('/logbook', upload.fields([
  { name: 'lampiran', maxCount: 5 }
]), createLogbook);

// Rute Tugas (Kanban)
router.get('/tugas', getTugas);
router.put('/tugas/:id/status', updateStatusTugas);
router.put('/tugas/:id/submit', upload.fields([
  { name: 'file_hasil', maxCount: 1 }
]), submitTugas);

export default router;
