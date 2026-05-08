import { Router } from 'express';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { register, login, refresh, logout, me, changePassword, forgotPassword, resetPassword, socialLogin } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// 5 tentatives par IP+email / 15 min — ne compte que les échecs
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `${req.ip}-${String(req.body?.email || '').toLowerCase()}`,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' },
});

// 5 demandes de reset par IP / 15 min
const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// 10 créations de compte par IP / heure
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de créations de compte. Réessayez dans 1 heure.' },
});

router.post(
  '/register',
  registerLimiter,
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
  loginLimiter,
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
router.post('/social', socialLogin);

router.post(
  '/forgot-password',
  resetLimiter,
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  forgotPassword
);

router.post(
  '/reset-password',
  resetLimiter,
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  ],
  validateRequest,
  resetPassword
);

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
