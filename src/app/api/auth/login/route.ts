import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';
import type { User } from '@/lib/types';

type DbUser = Omit<User, 'addresses' | 'wishlist'> & {
  addresses: string;
  wishlist: string;
};

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis.' }, { status: 400 });
    }

    const db = getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as DbUser | undefined;

    if (!row) {
      return NextResponse.json({ error: 'Aucun compte avec cet email.' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 });
    }

    const token = await signToken({ sub: row.id, email: row.email, role: row.role as 'user' | 'admin' });
    await setSessionCookie(token);

    const { password: _, ...safeUser } = {
      ...row,
      addresses: JSON.parse(row.addresses),
      wishlist: JSON.parse(row.wishlist),
    };

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    console.error('[login]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
