import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Order } from '@/lib/types';

type DbOrder = Omit<Order, 'items' | 'address'> & { items: string; address: string };

function parseOrder(row: DbOrder): Order {
  return { ...row, items: JSON.parse(row.items), address: JSON.parse(row.address) };
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  const { id } = await params;
  const db = getDb();
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as DbOrder | undefined;
  if (!row) return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });

  // Users can only see their own orders
  if (session.role !== 'admin' && row.userId !== session.sub) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  return NextResponse.json({ order: parseOrder(row) });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const db = getDb();
  const now = new Date().toISOString();

  if ('transiteur' in body) {
    db.prepare('UPDATE orders SET transiteur = ?, updatedAt = ? WHERE id = ?')
      .run(body.transiteur || null, now, id);
  } else {
    const { status } = body;
    const VALID_STATUSES = ['en_attente', 'confirme', 'en_preparation', 'expedie', 'livre', 'annule'];
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide.' }, { status: 400 });
    }
    db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?')
      .run(status, now, id);
  }

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as DbOrder;
  return NextResponse.json({ order: parseOrder(updated) });
}
