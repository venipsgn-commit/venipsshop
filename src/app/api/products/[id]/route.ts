import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Product } from '@/lib/types';

type DbProduct = Omit<Product, 'features' | 'specs' | 'images' | 'reviews' | 'isNew' | 'isFeatured'> & {
  features: string; specs: string; images: string; reviews: string;
  isNew: number; isFeatured: number;
};

function parseProduct(row: DbProduct): Product {
  return {
    ...row,
    features: JSON.parse(row.features),
    specs: JSON.parse(row.specs),
    images: JSON.parse(row.images),
    reviews: JSON.parse(row.reviews),
    isNew: row.isNew === 1,
    isFeatured: row.isFeatured === 1,
  };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as DbProduct | undefined;
  if (!row) return NextResponse.json({ error: 'Produit introuvable.' }, { status: 404 });
  return NextResponse.json({ product: parseProduct(row) });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const db = getDb();

    const allowed = ['name', 'brand', 'category', 'subcategory', 'price', 'originalPrice',
      'description', 'shortDesc', 'stock', 'badge', 'isNew', 'isFeatured', 'features', 'specs', 'images'];

    const sets: string[] = [];
    const vals: Record<string, unknown> = { id };

    for (const key of allowed) {
      if (key in body) {
        sets.push(`${key} = @${key}`);
        if (['features', 'specs', 'images'].includes(key)) {
          vals[key] = JSON.stringify(body[key]);
        } else if (['isNew', 'isFeatured'].includes(key)) {
          vals[key] = body[key] ? 1 : 0;
        } else {
          vals[key] = body[key];
        }
      }
    }

    if (sets.length === 0) return NextResponse.json({ error: 'Aucune mise à jour.' }, { status: 400 });

    db.prepare(`UPDATE products SET ${sets.join(', ')} WHERE id = @id`).run(vals);
    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id) as DbProduct;
    return NextResponse.json({ product: parseProduct(updated) });
  } catch (err) {
    console.error('[PUT /api/products/[id]]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const { id } = await params;
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(id);
  return NextResponse.json({ ok: true });
}
