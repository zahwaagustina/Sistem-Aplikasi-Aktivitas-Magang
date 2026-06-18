import express from 'express';
import { 
  getMyOnboarding, 
  respondOffer, 
  getAllOnboarding, 
  verifyDocuments, 
  issueLoa, 
  assignPlacement, 
  createAccount, 
  scheduleOrientation, 
  updateChecklist, 
  confirmOrientation 
} from '../controllers/onboardingController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `loa-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.use(authenticateToken);

// --- KANDIDAT ROUTES ---
router.get('/my', getMyOnboarding);
router.put('/:id/respond', respondOffer);
router.put('/checklist/:taskId', updateChecklist);
router.put('/:id/confirm-orientation', confirmOrientation);

// --- ADMIN ROUTES ---
router.get('/all', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), getAllOnboarding);
router.put('/:id/verify-docs', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), verifyDocuments);
router.post('/:id/issue-loa', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), upload.single('loa'), issueLoa);
router.put('/:id/assign-placement', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), assignPlacement);
router.put('/:id/create-account', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), createAccount);
router.put('/:id/schedule-orientation', authorizeRole(['ADMIN', 'SUPER_ADMIN', 'HR_ADMIN']), scheduleOrientation);

export default router;
