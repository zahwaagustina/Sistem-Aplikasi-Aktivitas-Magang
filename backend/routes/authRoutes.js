import express from 'express';
import { login, verifyEmail, requestPasswordReset, resetPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

export default router;
