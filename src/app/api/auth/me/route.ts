import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDb } from '@/lib/db';
import type { User } from '@/lib/types';

type DbUser = Omit<User, 'addresses' | 'wishlist'> & {
  addresses: string;
  wishlist: string;
};

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });

  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(session.sub) as DbUser | undefined;
  if (!row) return NextResponse.json({ user: null });

  const { password: _, ...safeUser } = {
    ...row,
    addresses: JSON.parse(row.addresses),
    wishlist: JSON.parse(row.wishlist),
  };

  return NextResponse.json({ user: safeUser });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });

  try {
    const updates = await req.json();
    const allowed = ['nom', 'prenom', 'telephone', 'avatar', 'addresses', 'wishlist'];
    const db = getDb();

    const sets: string[] = [];
    const vals: Record<string, unknown> = { id: session.sub };

    for (const key of allowed) {
      if (key in updates) {
        sets.push(`${key} = @${key}`);
        vals[key] = typeof updates[key] === 'object' ? JSON.stringify(updates[key]) : updates[key];
      }
    }

    if (sets.length === 0) return NextResponse.json({ error: 'Aucune mise à jour.' }, { status: 400 });

    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(vals);

    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(session.sub) as DbUser;
    const { password: _, ...safeUser } = {
      ...row,
      addresses: JSON.parse(row.addresses),
      wishlist: JSON.parse(row.wishlist),
    };
    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('[me PATCH]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
