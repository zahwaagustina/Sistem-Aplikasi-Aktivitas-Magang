import express from 'express';
import { updateProfile, getMagangUsers, uploadSuratKeterangan, getProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/magang', authenticateToken, getMagangUsers);
router.post('/:id/surat-keterangan', authenticateToken, upload.single('surat'), uploadSuratKeterangan);

export default router;
