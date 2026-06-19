import express from 'express';
import { login, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', login);
router.get('/verify-email', verifyEmail);

export default router;
