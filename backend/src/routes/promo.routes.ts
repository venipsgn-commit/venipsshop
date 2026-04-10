import { Router } from 'express';
import { body } from 'express-validator';
import { validatePromoCode, getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '../controllers/promo.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Public: validate a promo code
router.post('/validate', [body('code').trim().notEmpty()], validateRequest, validatePromoCode);

// Admin
router.get('/', authenticate, requireAdmin, getPromoCodes);
router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('code').trim().notEmpty(), body('discount').isInt({ min: 1, max: 100 })],
  validateRequest,
  createPromoCode
);
router.put('/:id', authenticate, requireAdmin, updatePromoCode);
router.delete('/:id', authenticate, requireAdmin, deletePromoCode);

export default router;
