import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// ── Profil: mettre à jour ─────────────────────────────────────────
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const { prenom, nom, telephone } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { prenom, nom, telephone },
    select: { id: true, email: true, prenom: true, nom: true, telephone: true, role: true },
  });
  res.json(user);
};

// ── Adresses ───────────────────────────────────────────────────────
export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  res.json(addresses);
};

export const addAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { label, prenom, nom, telephone, rue, commune, ville, pays, isDefault } = req.body;
  const userId = req.user!.userId;

  if (isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const address = await prisma.address.create({
    data: { userId, label: label || 'Domicile', prenom, nom, telephone, rue, commune, ville, pays: pays || 'Guinée', isDefault: isDefault || false },
  });
  res.status(201).json(address);
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user!.userId;
  const data = req.body;

  const address = await prisma.address.findFirst({ where: { id, userId } });
  if (!address) { res.status(404).json({ error: 'Adresse introuvable' }); return; }

  if (data.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }

  const updated = await prisma.address.update({ where: { id }, data });
  res.json(updated);
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const address = await prisma.address.findFirst({ where: { id, userId: req.user!.userId } });
  if (!address) { res.status(404).json({ error: 'Adresse introuvable' }); return; }
  await prisma.address.delete({ where: { id } });
  res.json({ message: 'Adresse supprimée' });
};

// ── Admin: liste utilisateurs ──────────────────────────────────────
export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', search } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {};
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { nom: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, prenom: true, nom: true, telephone: true, role: true, isActive: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, pagination: { page: parseInt(page), total, pages: Math.ceil(total / parseInt(limit)) } });
};

// ── Admin: activer/désactiver utilisateur ──────────────────────────
export const toggleUserActive = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) { res.status(404).json({ error: 'Utilisateur introuvable' }); return; }

  const updated = await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  res.json({ id: updated.id, isActive: updated.isActive });
};

// ── Admin: changer rôle ───────────────────────────────────────────
export const setUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body;
  const updated = await prisma.user.update({ where: { id }, data: { role } });
  res.json({ id: updated.id, role: updated.role });
};
