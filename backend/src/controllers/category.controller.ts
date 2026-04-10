import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  res.json(categories);
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, icon } = req.body;
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const category = await prisma.category.create({ data: { name, slug, description, icon } });
  res.status(201).json(category);
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, icon, isActive } = req.body;
  const data: any = { description, icon, isActive };
  if (name) {
    data.name = name;
    data.slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  const category = await prisma.category.update({ where: { id }, data });
  res.json(category);
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  await prisma.category.update({ where: { id }, data: { isActive: false } });
  res.json({ message: 'Catégorie désactivée' });
};
