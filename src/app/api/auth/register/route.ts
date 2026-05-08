import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? 'https://venipsshop-production.up.railway.app/api/v1';
const COOKIE  = 'venips_rt';

const COOKIE_OPTS = {
  httpOnly:  true,
  secure:    process.env.NODE_ENV === 'production',
  sameSite:  'strict' as const,
  maxAge:    7 * 24 * 60 * 60,
  path:      '/',
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  const upstream = await fetch(`${BACKEND}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  const data = await upstream.json();
  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const { refreshToken, ...rest } = data;
  const response = NextResponse.json(rest);
  response.cookies.set(COOKIE, refreshToken, COOKIE_OPTS);
  return response;
}
