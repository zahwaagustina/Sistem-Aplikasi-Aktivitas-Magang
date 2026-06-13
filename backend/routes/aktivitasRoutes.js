import express from 'express';
import { 
  createAktivitas, 
  getAllAktivitas, 
  getAktivitasById, 
  updateAktivitas, 
  deleteAktivitas, 
  approveAktivitas,
  kirimAktivitas,
  exportAktivitasBulanan
} from '../controllers/aktivitasController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', upload.single('foto'), createAktivitas);
router.get('/', getAllAktivitas);
router.get('/export', exportAktivitasBulanan);
router.get('/:id', getAktivitasById);
router.put('/:id', updateAktivitas);
router.delete('/:id', deleteAktivitas);

// Endpoint khusus magang untuk kirim draft
router.patch('/:id/kirim', kirimAktivitas);

// Endpoint khusus pembimbing / admin untuk approve aktivitas
router.patch('/:id/approve', authorizeRole(['ADMIN', 'PEMBIMBING']), approveAktivitas);

export default router;
