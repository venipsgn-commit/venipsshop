import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://venipsshop-production.up.railway.app/api/v1';
const COOKIE  = 'venips_rt';

const COOKIE_OPTS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'strict' as const,
  maxAge:    7 * 24 * 60 * 60,
  path:      '/',
};

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'Session expirée' }, { status: 401 });
  }

  const upstream = await fetch(`${BACKEND}/auth/refresh`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ refreshToken }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    const response = NextResponse.json(data, { status: upstream.status });
    response.cookies.delete(COOKIE);
    return response;
  }

  const { refreshToken: newRefreshToken, accessToken } = data;
  const response = NextResponse.json({ accessToken });
  response.cookies.set(COOKIE, newRefreshToken, COOKIE_OPTS);
  return response;
}
