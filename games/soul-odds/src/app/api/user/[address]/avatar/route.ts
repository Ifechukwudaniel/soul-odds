import { NextResponse } from 'next/server';
import { isAvatarId } from '@/components/assets/characters/avatar-ids';
import { requireApiSecret } from '@/libs/ApiAuth';
import { setAvatar } from '@/services/db/user';

export async function PUT(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { address } = await props.params;
  const { avatarId } = await request.json();

  if (!isAvatarId(avatarId)) {
    return NextResponse.json({ message: 'Missing or unknown "avatarId".' }, { status: 400 });
  }

  const updated = await setAvatar(address, avatarId);
  if (!updated) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
