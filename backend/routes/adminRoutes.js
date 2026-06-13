import express from 'express';
import { getAdminStats, getUsers, createUser, updateUser, deleteUser } from '../controllers/adminController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Only ADMIN can access these routes
router.use(authenticateToken);
router.use(authorizeRole(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
