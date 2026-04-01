import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Order, OrderItem } from '@/lib/types';

type DbOrder = Omit<Order, 'items' | 'address'> & { items: string; address: string };

function parseOrder(row: DbOrder): Order {
  return { ...row, items: JSON.parse(row.items), address: JSON.parse(row.address) };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const db = getDb();
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all');

  let rows: DbOrder[];
  if (all && session.role === 'admin') {
    rows = db.prepare('SELECT * FROM orders ORDER BY createdAt DESC').all() as DbOrder[];
  } else {
    rows = db.prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC').all(session.sub) as DbOrder[];
  }

  return NextResponse.json({ orders: rows.map(parseOrder) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Connexion requise.' }, { status: 401 });

  try {
    const body = await req.json();
    const { items, address, paymentMethod, promoCode, transiteur } = body;

    // ── Validation ──────────────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Le panier est vide.' }, { status: 400 });
    }
    if (!address || !address.nom || !address.rue || !address.ville) {
      return NextResponse.json({ error: 'Adresse de livraison invalide.' }, { status: 400 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ error: 'Mode de paiement requis.' }, { status: 400 });
    }

    const db = getDb();

    // ── Verify prices & stock server-side ───────────────────────────────────
    let subtotal = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      const product = db.prepare('SELECT id, name, price, stock, images FROM products WHERE id = ?').get(item.productId) as {
        id: string; name: string; price: number; stock: number; images: string;
      } | undefined;

      if (!product) {
        return NextResponse.json({ error: `Produit introuvable: ${item.productId}` }, { status: 400 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stock insuffisant pour "${product.name}".` }, { status: 400 });
      }

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: JSON.parse(product.images)[0] ?? '',
        quantity: item.quantity,
        price: product.price, // Use server price, not client price
      });
      subtotal += product.price * item.quantity;
    }

    // ── Promo code validation ────────────────────────────────────────────────
    const PROMO_CODES: Record<string, { discount: number; minOrder: number }> = {
      'GUINEE10': { discount: 10, minOrder: 500000 },
      'BIENVENUE': { discount: 5, minOrder: 200000 },
    };

    let discount = 0;
    if (promoCode) {
      const promo = PROMO_CODES[promoCode.toUpperCase()];
      if (!promo) return NextResponse.json({ error: 'Code promo invalide.' }, { status: 400 });
      if (subtotal < promo.minOrder) {
        return NextResponse.json({ error: `Commande minimum de ${promo.minOrder} GNF pour ce code.` }, { status: 400 });
      }
      discount = Math.round(subtotal * promo.discount / 100);
    }

    const shippingCost = subtotal >= 100000 ? 0 : 15000;
    const total = subtotal - discount + shippingCost;

    // ── Decrement stock ──────────────────────────────────────────────────────
    const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    const createOrderStmt = db.prepare(`
      INSERT INTO orders
        (id, userId, items, subtotal, shippingCost, discount, total, status,
         promoCode, address, paymentMethod, transiteur, estimatedDelivery, createdAt, updatedAt)
      VALUES
        (@id, @userId, @items, @subtotal, @shippingCost, @discount, @total, @status,
         @promoCode, @address, @paymentMethod, @transiteur, @estimatedDelivery, @createdAt, @updatedAt)
    `);

    const now = new Date().toISOString();
    const deliveryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const orderId = `ORD-${Date.now()}`;

    db.transaction(() => {
      for (const item of validatedItems) {
        updateStock.run(item.quantity, item.productId);
      }
      createOrderStmt.run({
        id: orderId,
        userId: session.sub,
        items: JSON.stringify(validatedItems),
        subtotal,
        shippingCost,
        discount,
        total,
        status: 'en_attente',
        promoCode: promoCode ?? null,
        address: JSON.stringify(address),
        paymentMethod,
        transiteur: transiteur ?? null,
        estimatedDelivery: deliveryDate,
        createdAt: now,
        updatedAt: now,
      });
    })();

    const newOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as DbOrder;
    return NextResponse.json({ order: parseOrder(newOrder) }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/orders]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
