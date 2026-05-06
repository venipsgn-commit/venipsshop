import { Router } from 'express';
import { body, query } from 'express-validator';
import { getProducts, getProductsAdmin, getProduct, createProduct, updateProduct, deleteProduct, addReview, toggleWishlist, getWishlist } from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getProducts);

// Admin — liste complète (actifs + inactifs), doit être avant /:slug
router.get('/admin/all', authenticate, requireAdmin, getProductsAdmin);

router.get('/:slug', getProduct);

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('price').isInt({ min: 0 }),
    body('stock').isInt({ min: 0 }),
    body('categoryId').isUUID(),
    body('brand').trim().notEmpty(),
  ],
  validateRequest,
  createProduct
);

router.put('/:id', authenticate, requireAdmin, updateProduct);
router.delete('/:id', authenticate, requireAdmin, deleteProduct);

// Auth users
router.post(
  '/:id/reviews',
  authenticate,
  [body('rating').isInt({ min: 1, max: 5 }), body('comment').optional().trim()],
  validateRequest,
  addReview
);

router.post('/:id/wishlist', authenticate, toggleWishlist);
router.get('/me/wishlist', authenticate, getWishlist);

export default router;
