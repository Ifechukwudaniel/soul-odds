import { NextResponse } from 'next/server';
import { requireApiSecret } from '@/libs/ApiAuth';
import { addPoints } from '@/services/db/user';

export async function POST(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { address } = await props.params;
  const { delta } = await request.json();

  if (typeof delta !== 'number' || !Number.isFinite(delta)) {
    return NextResponse.json({ message: 'Missing or invalid "delta".' }, { status: 400 });
  }

  await addPoints(address, delta);
  return new NextResponse(null, { status: 204 });
}
