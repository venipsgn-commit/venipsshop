import { Router } from 'express';
import { body } from 'express-validator';
import { updateProfile, getAddresses, addAddress, updateAddress, deleteAddress, getUsers, toggleUserActive, setUserRole } from '../controllers/user.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// User profile
router.put('/me', [body('prenom').optional().trim(), body('nom').optional().trim()], validateRequest, updateProfile);

// Addresses
router.get('/me/addresses', getAddresses);
router.post(
  '/me/addresses',
  [
    body('prenom').trim().notEmpty(),
    body('nom').trim().notEmpty(),
    body('telephone').trim().notEmpty(),
    body('rue').trim().notEmpty(),
    body('ville').trim().notEmpty(),
  ],
  validateRequest,
  addAddress
);
router.put('/me/addresses/:id', updateAddress);
router.delete('/me/addresses/:id', deleteAddress);

// Admin
router.get('/', requireAdmin, getUsers);
router.put('/:id/toggle-active', requireAdmin, toggleUserActive);
router.put('/:id/role', requireAdmin, [body('role').isIn(['USER', 'ADMIN'])], validateRequest, setUserRole);

export default router;
