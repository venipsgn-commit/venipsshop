import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import type { User, Order } from '@/lib/types';

type DbUser = Omit<User, 'addresses' | 'wishlist'> & { addresses: string; wishlist: string };
type DbOrder = Omit<Order, 'items' | 'address'> & { items: string; address: string };

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });
  }

  const db = getDb();
  const users = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all() as DbUser[];
  const orders = db.prepare('SELECT userId, total, status FROM orders').all() as Pick<DbOrder, 'userId' | 'total' | 'status'>[];

  const result = users.map(u => {
    const { password: _, ...safe } = {
      ...u,
      addresses: JSON.parse(u.addresses),
      wishlist: JSON.parse(u.wishlist),
    };
    const userOrders = orders.filter(o => o.userId === u.id);
    const spent = userOrders.filter(o => o.status === 'livre').reduce((s, o) => s + (o as DbOrder & {total: number}).total, 0);
    return { ...safe, orderCount: userOrders.length, totalSpent: spent };
  });

  return NextResponse.json({ users: result });
}
