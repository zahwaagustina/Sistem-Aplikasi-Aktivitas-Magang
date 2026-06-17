import express from 'express';
import { applyLowongan, getMyApplications } from '../controllers/kandidatController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole(['KANDIDAT']));

router.post('/apply', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'surat_pengantar', maxCount: 1 },
  { name: 'transkrip', maxCount: 1 },
  { name: 'ktp', maxCount: 1 }
]), applyLowongan);

router.get('/applications', getMyApplications);

export default router;
