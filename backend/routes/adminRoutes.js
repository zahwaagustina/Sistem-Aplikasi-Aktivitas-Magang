import express from 'express';
import { getAdminStats, getDashboardAnalytics, getAuditLogs, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Only authorized admins can access these routes
router.use(authenticateToken);
// All routes require SUPER_ADMIN
router.use(authorizeRole(['SUPER_ADMIN']));

router.get('/stats', getAdminStats);
router.get('/analytics', getDashboardAnalytics);

router.get('/audit-logs', getAuditLogs);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

import { 
  getAspekPenilaian, 
  createAspekPenilaian, 
  updateAspekPenilaian, 
  deleteAspekPenilaian,
  getPertanyaanPenilaian,
  createPertanyaanPenilaian,
  updatePertanyaanPenilaian,
  deletePertanyaanPenilaian
} from '../controllers/evaluasiMasterController.js';

router.get('/evaluasi-aspek', getAspekPenilaian);
router.post('/evaluasi-aspek', createAspekPenilaian);
router.put('/evaluasi-aspek/:id', updateAspekPenilaian);
router.delete('/evaluasi-aspek/:id', deleteAspekPenilaian);

router.get('/evaluasi-pertanyaan', getPertanyaanPenilaian);
router.post('/evaluasi-pertanyaan', createPertanyaanPenilaian);
router.put('/evaluasi-pertanyaan/:id', updatePertanyaanPenilaian);
router.delete('/evaluasi-pertanyaan/:id', deletePertanyaanPenilaian);

export default router;
