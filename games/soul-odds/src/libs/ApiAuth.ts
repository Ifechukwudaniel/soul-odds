import { NextResponse } from 'next/server';
import { Env } from '@/libs/Env';

/**
 * Gates an API route behind `NEXT_PUBLIC_API_SECRET` (the `x-api-secret` header). Returns a 401
 * response to short-circuit the route, or `null` when the request is allowed; with no secret
 * configured every request passes.
 */
export function requireApiSecret(request: Request): NextResponse | null {
  const secret = Env.NEXT_PUBLIC_API_SECRET;
  if (!secret) {
    return null;
  }

  if (request.headers.get('x-api-secret') !== secret) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  return null;
}
