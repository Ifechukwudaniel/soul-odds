import { NextResponse } from 'next/server';
import * as z from 'zod';
import { betHistoryEntrySchema } from '@/lib/mortal-odds/bet-history';
import { requireApiSecret } from '@/libs/ApiAuth';
import { findBetHistory, insertBetHistory, patchBetHistoryStory } from '@/services/db/bet-history';

const MAX_UPLOAD_ENTRIES = 100;

const recordSchema = z.object({
  entries: z.array(betHistoryEntrySchema).min(1).max(MAX_UPLOAD_ENTRIES),
});
const patchSchema = z.object({
  id: z.string().min(1),
  story: z.string().min(1),
  name: z.string().max(60).nullable(),
});

export async function GET(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { address } = await props.params;
  return NextResponse.json(await findBetHistory(address));
}

/** Records settled rounds; also the one-off upload of a wallet's browser-stored history. */
export async function POST(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = recordSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ message: 'Missing or invalid "entries".' }, { status: 400 });
  }

  const { address } = await props.params;
  await insertBetHistory(address, body.data.entries);
  return new NextResponse(null, { status: 204 });
}

/** Swaps in the AI-written story and soul name for an already-recorded round. */
export async function PATCH(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = patchSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json(
      { message: 'Missing or invalid "id", "story" or "name".' },
      { status: 400 },
    );
  }

  const { address } = await props.params;
  const { id, ...patch } = body.data;
  await patchBetHistoryStory(address, id, patch);
  return new NextResponse(null, { status: 204 });
}
