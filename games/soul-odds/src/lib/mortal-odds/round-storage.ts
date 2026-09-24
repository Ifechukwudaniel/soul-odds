import type { HostSnapshotV1 } from '@chain/casino-sdk/guest';
import type { MortalOddsDrawPhase, RevealResult } from '@/hooks/useMortalOddsDraw';
import type { Bet, Draw, EraFilter, RoundCharge } from '@/types';

const VERSION = 1;

/** The phases a round can be picked back up in; "drawing" is saved as "when", since the spin is only flavor. */
export const RESUMABLE_PHASES = [
  'when',
  'where',
  'predicting',
  'confirming',
  'settling',
  'revealed',
] as const;
export type ResumablePhase = (typeof RESUMABLE_PHASES)[number];

/** What the host can't hand back after a refresh: the local flavor draw, the player's picks and the reveal. */
export type StoredRound = {
  version: typeof VERSION;
  sessionKey: string;
  wagerWei: string;
  phase: ResumablePhase;
  era: EraFilter;
  draw: Draw;
  story: string;
  samplesSeed: number;
  bets: Record<string, Bet>;
  charges: RoundCharge[];
  chipSize: number;
  /** The era configuration the contract fixed for the round; absent on rounds saved before it was tracked. */
  configurationIndex?: number | null;
  reveal: RevealResult | null;
};

export function toResumablePhase(phase: MortalOddsDrawPhase): ResumablePhase | null {
  if (phase === 'drawing') return 'when';
  return RESUMABLE_PHASES.find((resumable) => resumable === phase) ?? null;
}

/** One saved round per chain, game and wallet, so switching wallets never resumes someone else's round. */
export function roundStorageKey(snapshot: HostSnapshotV1): string | null {
  const wallet = snapshot.wallet.smartVaultAddress ?? snapshot.wallet.address;
  if (!wallet) return null;
  return `mortal-odds-round:v${VERSION}:${snapshot.integration.chainId}:${snapshot.integration.gameAddress}:${wallet}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStoredRound(value: unknown): value is StoredRound {
  if (!isRecord(value)) return false;
  const { draw } = value;
  return (
    value.version === VERSION &&
    typeof value.sessionKey === 'string' &&
    typeof value.wagerWei === 'string' &&
    /^\d+$/.test(value.wagerWei) &&
    RESUMABLE_PHASES.some((phase) => phase === value.phase) &&
    typeof value.era === 'string' &&
    isRecord(draw) &&
    typeof draw.year === 'number' &&
    typeof draw.region === 'string' &&
    isRecord(draw.place) &&
    typeof draw.place.name === 'string' &&
    typeof value.story === 'string' &&
    typeof value.samplesSeed === 'number' &&
    isRecord(value.bets) &&
    Array.isArray(value.charges) &&
    typeof value.chipSize === 'number' &&
    (value.phase === 'revealed' ? isRecord(value.reveal) : value.reveal === null)
  );
}

export function readRound(key: string): StoredRound | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isStoredRound(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeRound(key: string, round: StoredRound): void {
  try {
    localStorage.setItem(key, JSON.stringify(round));
  } catch {
    /* storage unavailable: the round still plays, it just can't be resumed */
  }
}

export function clearRound(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage unavailable: nothing to clear */
  }
}
