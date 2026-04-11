import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, refresh, logout, me, changePassword, setupAdmin } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
    body('prenom').trim().notEmpty().withMessage('Prénom requis'),
    body('nom').trim().notEmpty().withMessage('Nom requis'),
    body('telephone').optional().trim(),
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  login
);

router.post('/setup-admin', setupAdmin);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', authenticate, me);

router.put(
  '/change-password',
  authenticate,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères'),
  ],
  validateRequest,
  changePassword
);

export default router;
