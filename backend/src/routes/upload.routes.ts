import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { signCloudinaryUpload } from '../controllers/upload.controller';

const router = Router();

// Seul un admin connecté peut obtenir une signature d'upload
router.post('/sign', authenticate, requireAdmin, signCloudinaryUpload);

export default router;
