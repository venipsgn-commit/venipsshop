import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

function generateOrderNumber(): string {
  const date = new Date();
  const yy = date.getFullYear().toString().slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VNP-${yy}${mm}${dd}-${rand}`;
}

// ── Créer une commande ────────────────────────────────────────────
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, addressId, paymentMethod, promoCode, notes } = req.body;
  const userId = req.user!.userId;

  // Validate & price each item from DB
  const productIds: string[] = items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  });

  const productMap = new Map(products.map(p => [p.id, p]));
  const orderItems: { productId: string; name: string; price: number; quantity: number; image?: string }[] = [];
  let subtotal = 0;

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) { res.status(400).json({ error: `Produit ${item.productId} introuvable ou inactif` }); return; }
    if (product.stock < item.quantity) { res.status(400).json({ error: `Stock insuffisant pour ${product.name}` }); return; }
    orderItems.push({ productId: product.id, name: product.name, price: product.price, quantity: item.quantity, image: product.images[0] });
    subtotal += product.price * item.quantity;
  }

  // Promo code
  let discount = 0;
  if (promoCode) {
    const promo = await prisma.promoCode.findUnique({ where: { code: promoCode } });
    if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date()) && subtotal >= promo.minOrder && (!promo.maxUses || promo.currentUses < promo.maxUses)) {
      discount = Math.round(subtotal * promo.discount / 100);
      await prisma.promoCode.update({ where: { code: promoCode }, data: { currentUses: { increment: 1 } } });
    }
  }

  const shippingCost = 0; // Free delivery in Guinea for now
  const total = subtotal - discount + shippingCost;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        addressId: addressId || null,
        subtotal,
        shippingCost,
        discount,
        total,
        paymentMethod,
        promoCode: promoCode || null,
        notes: notes || null,
        items: { create: orderItems },
      },
      include: { items: true, address: true },
    });

    // Decrement stock
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return newOrder;
  });

  res.status(201).json(order);
};

// ── Mes commandes ─────────────────────────────────────────────────
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '10' } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const userId = req.user!.userId;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: { items: true, address: true },
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  res.json({ orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
};

// ── Détail commande ───────────────────────────────────────────────
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === 'ADMIN';

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, address: true, user: { select: { prenom: true, nom: true, email: true, telephone: true } } },
  });

  if (!order) { res.status(404).json({ error: 'Commande introuvable' }); return; }
  if (!isAdmin && order.userId !== userId) { res.status(403).json({ error: 'Accès refusé' }); return; }

  res.json(order);
};

// ── Annuler commande ──────────────────────────────────────────────
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.userId;

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) { res.status(404).json({ error: 'Commande introuvable' }); return; }
  if (order.userId !== userId) { res.status(403).json({ error: 'Accès refusé' }); return; }
  if (!['EN_ATTENTE', 'CONFIRME'].includes(order.status)) {
    res.status(400).json({ error: 'Cette commande ne peut plus être annulée' }); return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { id }, data: { status: 'ANNULE' } });
    for (const item of order.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
    }
  });

  res.json({ message: 'Commande annulée' });
};

// ── Admin: toutes les commandes ───────────────────────────────────
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', status } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { prenom: true, nom: true, email: true } },
        address: true,
      },
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
};

// ── Admin: changer statut commande ───────────────────────────────
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;

  const data: any = {};
  if (status) data.status = status;
  if (paymentStatus) data.paymentStatus = paymentStatus;

  const order = await prisma.order.update({ where: { id }, data, include: { items: true, address: true } });
  res.json(order);
};
