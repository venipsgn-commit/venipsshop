import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Product } from '@/lib/types';

type DbProduct = Omit<Product, 'features' | 'specs' | 'images' | 'reviews' | 'isNew' | 'isFeatured'> & {
  features: string;
  specs: string;
  images: string;
  reviews: string;
  isNew: number;
  isFeatured: number;
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

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const featured = searchParams.get('featured');

  let rows: DbProduct[];
  if (category && category !== 'all') {
    rows = db.prepare('SELECT * FROM products WHERE category = ?').all(category) as DbProduct[];
  } else if (featured) {
    rows = db.prepare('SELECT * FROM products WHERE isFeatured = 1').all() as DbProduct[];
  } else {
    rows = db.prepare('SELECT * FROM products').all() as DbProduct[];
  }

  return NextResponse.json({ products: rows.map(parseProduct) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, brand, category, subcategory, price, stock } = body;

    if (!name || !brand || !category || !subcategory || price == null || stock == null) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const db = getDb();
    const product = {
      id: `prod_${Date.now()}`,
      name,
      brand,
      category,
      subcategory,
      price: Number(price),
      originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
      description: body.description ?? '',
      shortDesc: body.shortDesc ?? '',
      features: JSON.stringify(body.features ?? []),
      specs: JSON.stringify(body.specs ?? {}),
      images: JSON.stringify(body.images ?? []),
      stock: Number(stock),
      rating: 0,
      reviewCount: 0,
      reviews: '[]',
      badge: body.badge ?? null,
      isNew: body.isNew ? 1 : 0,
      isFeatured: body.isFeatured ? 1 : 0,
    };

    db.prepare(`
      INSERT INTO products
        (id, name, brand, category, subcategory, price, originalPrice, description, shortDesc,
         features, specs, images, stock, rating, reviewCount, reviews, badge, isNew, isFeatured)
      VALUES
        (@id, @name, @brand, @category, @subcategory, @price, @originalPrice, @description, @shortDesc,
         @features, @specs, @images, @stock, @rating, @reviewCount, @reviews, @badge, @isNew, @isFeatured)
    `).run(product);

    return NextResponse.json({ product: parseProduct({ ...product, isNew: product.isNew, isFeatured: product.isFeatured } as DbProduct) }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/products]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
