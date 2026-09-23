import { and, desc, eq } from 'drizzle-orm';
import { db } from '.';
import { type BetHistoryRow, betHistorySchema } from './Schema';
import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';

const HISTORY_LIMIT = 100;

// Addresses are stored lowercase so lookups don't depend on checksum casing.
function normalizeAddress(address: string) {
  return address.toLowerCase();
}

function toEntry(row: BetHistoryRow): BetHistoryEntry {
  const { address: _address, settledAt, sex, ...rest } = row;
  return { ...rest, settledAt: settledAt.getTime(), sex: sex === 'girl' ? 'girl' : 'boy' };
}

/** A wallet's most recent settled rounds, newest first. */
export async function findBetHistory(address: string): Promise<BetHistoryEntry[]> {
  const rows = await db
    .select()
    .from(betHistorySchema)
    .where(eq(betHistorySchema.address, normalizeAddress(address)))
    .orderBy(desc(betHistorySchema.settledAt))
    .limit(HISTORY_LIMIT);
  return rows.map(toEntry);
}

/** Records rounds for a wallet; a round already on file is kept as is, so re-sending one never undoes its AI-written story. */
export async function insertBetHistory(address: string, entries: BetHistoryEntry[]): Promise<void> {
  if (entries.length === 0) return;
  await db
    .insert(betHistorySchema)
    .values(entries.map((entry) => ({ ...entry, address: normalizeAddress(address), settledAt: new Date(entry.settledAt) })))
    .onConflictDoNothing();
}

/** Fills in the AI-written story and soul name once they land, after the round was first recorded. */
export async function patchBetHistoryStory(
  address: string,
  id: string,
  patch: Pick<BetHistoryEntry, 'story' | 'name'>,
): Promise<void> {
  await db
    .update(betHistorySchema)
    .set(patch)
    .where(and(eq(betHistorySchema.address, normalizeAddress(address)), eq(betHistorySchema.id, id)));
}
