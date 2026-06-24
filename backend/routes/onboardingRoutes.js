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
  confirmOrientation,
  uploadOnboardingDocs,
  downloadLoa
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

const uploadDocsStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `onb-${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const uploadDocs = multer({ storage: uploadDocsStorage });

router.use(authenticateToken);

// --- KANDIDAT ROUTES ---
router.get('/my', getMyOnboarding);
router.put('/:id/respond', respondOffer);
router.post('/:id/upload-docs', uploadDocs.fields([{ name: 'ktp', maxCount: 1 }, { name: 'surat_pengantar', maxCount: 1 }, { name: 'surat_kerjasama', maxCount: 1 }]), uploadOnboardingDocs);
router.put('/checklist/:taskId', updateChecklist);
router.put('/:id/confirm-orientation', confirmOrientation);
router.put('/:id/download-loa', downloadLoa);

// --- ADMIN ROUTES ---
router.get('/all', authorizeRole(['SUPER_ADMIN']), getAllOnboarding);
router.put('/:id/verify-docs', authorizeRole(['SUPER_ADMIN']), verifyDocuments);
router.post('/:id/issue-loa', authorizeRole(['SUPER_ADMIN']), issueLoa);
router.put('/:id/assign-placement', authorizeRole(['SUPER_ADMIN']), assignPlacement);
router.put('/:id/create-account', authorizeRole(['SUPER_ADMIN']), createAccount);
router.put('/:id/schedule-orientation', authorizeRole(['SUPER_ADMIN']), scheduleOrientation);

export default router;
