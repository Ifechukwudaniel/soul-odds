import { NextRequest, NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { requireApiSecret } from '@/libs/ApiAuth';
import { createUser, findAllUsers, findUser, updateUser } from '@/services/db/user';

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const users = await findAllUsers();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { address, referredBy, balance } = await request.json();
    if (!address) return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    if (!isAddress(address, { strict: false })) {
      return NextResponse.json({ error: 'Is Not An Address.' }, { status: 400 });
    }

    const validBalance =
      typeof balance === 'number' && Number.isFinite(balance) ? balance : undefined;

    const user = await findUser(address);

    if (user) {
      if (validBalance !== undefined && validBalance !== user.balance) {
        await updateUser({ address: user.address, balance: validBalance });
      }
      return new NextResponse(null, { status: 204 });
    }

    const validReferrer =
      referredBy &&
      isAddress(referredBy, { strict: false }) &&
      referredBy.toLowerCase() !== address.toLowerCase()
        ? referredBy
        : undefined;

    const newUser = await createUser(address, validReferrer, validBalance);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating  new  user:', error);
    return NextResponse.json(
      { message: 'An unexpected error occurred while creating the user.' },
      { status: 500 },
    );
  }
}
