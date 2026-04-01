import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { signToken, setSessionCookie } from '@/lib/auth';
import type { User } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { nom, prenom, email, telephone, password } = await req.json();

    if (!nom || !prenom || !email || !telephone || !password) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé.' }, { status: 409 });
    }

    const isFirstUser = (db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number }).c === 0;
    const hashed = await bcrypt.hash(password, 12);

    const user: Omit<User, 'addresses' | 'wishlist'> & { addresses: string; wishlist: string } = {
      id: `usr_${Date.now()}`,
      nom,
      prenom,
      email: email.toLowerCase(),
      telephone,
      password: hashed,
      role: isFirstUser ? 'admin' : 'user',
      addresses: '[]',
      wishlist: '[]',
      createdAt: new Date().toISOString(),
    };

    db.prepare(`
      INSERT INTO users (id, nom, prenom, email, telephone, password, role, addresses, wishlist, createdAt)
      VALUES (@id, @nom, @prenom, @email, @telephone, @password, @role, @addresses, @wishlist, @createdAt)
    `).run(user);

    const token = await signToken({ sub: user.id, email: user.email, role: user.role as 'user' | 'admin' });
    await setSessionCookie(token);

    const { password: _, ...safeUser } = { ...user, addresses: [], wishlist: [] };
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (err) {
    console.error('[register]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
