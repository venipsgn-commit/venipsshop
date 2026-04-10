import { Router } from 'express';
import { body } from 'express-validator';
import { createOrder, getMyOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

// User routes
router.post(
  '/',
  [
    body('items').isArray({ min: 1 }),
    body('items.*.productId').isUUID(),
    body('items.*.quantity').isInt({ min: 1 }),
    body('paymentMethod').isIn(['WAVE', 'ORANGE_MONEY', 'CARTE', 'CASH']),
  ],
  validateRequest,
  createOrder
);

router.get('/me', getMyOrders);
router.get('/:id', getOrder);
router.post('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', requireAdmin, getAllOrders);
router.put(
  '/:id/status',
  requireAdmin,
  [body('status').optional().isIn(['EN_ATTENTE', 'CONFIRME', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE', 'ANNULE']),
   body('paymentStatus').optional().isIn(['EN_ATTENTE', 'PAYE', 'REMBOURSE', 'ECHOUE'])],
  validateRequest,
  updateOrderStatus
);

export default router;
