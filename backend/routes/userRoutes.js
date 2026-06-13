import express from 'express';
import { updateProfile, getMagangUsers } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.put('/profile', authenticateToken, updateProfile);
router.get('/magang', authenticateToken, getMagangUsers);

export default router;
