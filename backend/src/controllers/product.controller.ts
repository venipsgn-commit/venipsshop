import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Liste produits (public) ───────────────────────────────────────
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const {
    page = '1',
    limit = '12',
    category,
    search,
    minPrice,
    maxPrice,
    badge,
    sort = 'createdAt_desc',
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where: any = { isActive: true };
  if (category) where.category = { slug: category };
  if (badge) where.badge = badge;
  if (search) where.name = { contains: search, mode: 'insensitive' };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  const [field, direction] = sort.split('_');
  const orderBy: any = { [field]: direction === 'asc' ? 'asc' : 'desc' };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { category: { select: { name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  res.json({
    products,
    pagination: { page: parseInt(page), limit: take, total, pages: Math.ceil(total / take) },
  });
};

// ── Détail produit (public) — accepte slug OU id ──────────────────
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

  const product = await prisma.product.findFirst({
    where: {
      isActive: true,
      OR: isUuid ? [{ id: slug }, { slug }] : [{ slug }],
    },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { prenom: true, nom: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
  if (!product) { res.status(404).json({ error: 'Produit introuvable' }); return; }
  res.json(product);
};

// ── Créer produit (admin) ─────────────────────────────────────────
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, shortDesc, price, originalPrice, stock, categoryId, brand, badge, images, features, specs } = req.body;

  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const existing = await prisma.product.findUnique({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const product = await prisma.product.create({
    data: { name, slug: finalSlug, description, shortDesc, price, originalPrice, stock, categoryId, brand, badge, images: images || [], features: features || [], specs: specs || {} },
    include: { category: { select: { name: true, slug: true } } },
  });
  res.status(201).json(product);
};

// ── Modifier produit (admin) ──────────────────────────────────────
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = req.body;
  delete data.slug; // never update slug directly

  const product = await prisma.product.update({ where: { id }, data });
  res.json(product);
};

// ── Supprimer produit (admin) ─────────────────────────────────────
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  res.json({ message: 'Produit désactivé' });
};

// ── Avis produit ──────────────────────────────────────────────────
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user!.userId;

  const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) { res.status(409).json({ error: 'Vous avez déjà noté ce produit' }); return; }

  const review = await prisma.review.create({
    data: { userId, productId, rating: parseInt(rating), comment },
    include: { user: { select: { prenom: true, nom: true } } },
  });

  // Update product rating average
  const agg = await prisma.review.aggregate({ where: { productId, isVisible: true }, _avg: { rating: true }, _count: true });
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round((agg._avg.rating || 0) * 10) / 10, reviewCount: agg._count },
  });

  res.status(201).json(review);
};

// ── Wishlist ───────────────────────────────────────────────────────
export const toggleWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const userId = req.user!.userId;

  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { userId_productId: { userId, productId } } });
    res.json({ wishlisted: false });
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    res.json({ wishlisted: true });
  }
};

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    include: { product: { include: { category: { select: { name: true, slug: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(items.map(i => i.product));
};
