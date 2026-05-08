import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://venipsshop-production.up.railway.app/api/v1';
const COOKIE  = 'venips_rt';

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE)?.value;

  if (refreshToken) {
    // Invalider le refresh token côté backend (fire-and-forget)
    fetch(`${BACKEND}/auth/logout`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: 'Déconnecté' });
  response.cookies.delete(COOKIE);
  return response;
}
