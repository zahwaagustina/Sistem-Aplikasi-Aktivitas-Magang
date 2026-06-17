import express from 'express';
import { getLowongan, getLowonganById, registerKandidat } from '../controllers/publicController.js';

const router = express.Router();

router.get('/lowongan', getLowongan);
router.get('/lowongan/:id', getLowonganById);
router.post('/register', registerKandidat);

export default router;
