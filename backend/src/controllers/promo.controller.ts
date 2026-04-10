import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Vérifier un code promo (public) ──────────────────────────────
export const validatePromoCode = async (req: Request, res: Response): Promise<void> => {
  const { code, orderAmount } = req.body;

  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.isActive) { res.status(404).json({ error: 'Code promo invalide' }); return; }
  if (promo.expiresAt && promo.expiresAt < new Date()) { res.status(400).json({ error: 'Code promo expiré' }); return; }
  if (promo.maxUses && promo.currentUses >= promo.maxUses) { res.status(400).json({ error: 'Code promo épuisé' }); return; }
  if (orderAmount && orderAmount < promo.minOrder) {
    res.status(400).json({ error: `Commande minimum de ${promo.minOrder} GNF requis` }); return;
  }

  const discountAmount = orderAmount ? Math.round(orderAmount * promo.discount / 100) : null;
  res.json({ valid: true, discount: promo.discount, discountAmount, minOrder: promo.minOrder });
};

// ── Admin: CRUD codes promo ───────────────────────────────────────
export const getPromoCodes = async (_req: AuthRequest, res: Response): Promise<void> => {
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(promos);
};

export const createPromoCode = async (req: AuthRequest, res: Response): Promise<void> => {
  const { code, discount, minOrder, maxUses, expiresAt } = req.body;

  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) { res.status(409).json({ error: 'Ce code existe déjà' }); return; }

  const promo = await prisma.promoCode.create({
    data: {
      code: code.toUpperCase(),
      discount: parseInt(discount),
      minOrder: minOrder ? parseInt(minOrder) : 0,
      maxUses: maxUses ? parseInt(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    },
  });
  res.status(201).json(promo);
};

export const updatePromoCode = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { discount, minOrder, maxUses, expiresAt, isActive } = req.body;
  const data: any = {};
  if (discount !== undefined) data.discount = parseInt(discount);
  if (minOrder !== undefined) data.minOrder = parseInt(minOrder);
  if (maxUses !== undefined) data.maxUses = maxUses ? parseInt(maxUses) : null;
  if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null;
  if (isActive !== undefined) data.isActive = isActive;

  const promo = await prisma.promoCode.update({ where: { id }, data });
  res.json(promo);
};

export const deletePromoCode = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.promoCode.delete({ where: { id } });
  res.json({ message: 'Code promo supprimé' });
};
