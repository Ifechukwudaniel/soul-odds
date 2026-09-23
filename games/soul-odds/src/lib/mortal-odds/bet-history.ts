import type { HostSnapshotV1 } from "@chain/casino-sdk/guest";
import type { RevealResult } from "@/hooks/useMortalOddsDraw";
import { sinsOf } from "@/lib/mortal-odds/sin-selection";
import type { BetResult, Draw, RoundCharge, Sex } from "@/types";

const VERSION = 1;
export const MAX_HISTORY_ENTRIES = 100;

export type BetHistoryBet = Pick<BetResult, "marketId" | "marketLabel" | "pickLabel" | "outcomeLabel" | "won" | "stake" | "net" | "odds">;

/** One settled round: the soul that was drawn, every bet placed on it and how the money moved. */
export type BetHistoryEntry = {
  id: string;
  settledAt: number;
  /** Where the soul lived. Kept for future use; not shown in the history. */
  placeName: string;
  lat: number;
  lon: number;
  name: string | null;
  story: string;
  bornYear: number;
  deathYear: number;
  age: number;
  sex: Sex;
  sin: string | null;
  /** The round's locked wager. */
  wager: number;
  /** Redraw fees paid on top of the wager. */
  fees: number;
  /** What the bets returned; the wager is already reflected in it. */
  net: number;
  /** `net` after fees. */
  roundNet: number;
  skill: number;
  bets: BetHistoryBet[];
};

/** One history per chain, game and wallet, so switching wallets never shows someone else's rounds. */
export function historyStorageKey(snapshot: HostSnapshotV1): string | null {
  const wallet = snapshot.wallet.smartVaultAddress ?? snapshot.wallet.address;
  if (!wallet) return null;
  return `mortal-odds-history:v${VERSION}:${snapshot.integration.chainId}:${snapshot.integration.gameAddress}:${wallet}`;
}

export function toHistoryEntry(options: {
  sessionKey: string;
  reveal: RevealResult;
  draw: Draw;
  charges: RoundCharge[];
  settledAt: number;
}): BetHistoryEntry {
  const { reveal, draw, charges } = options;
  const fees = charges.filter((charge) => charge.kind === "fee").reduce((sum, charge) => sum + charge.amount, 0);
  const wager = charges.find((charge) => charge.kind === "stake")?.amount ?? 0;

  return {
    id: options.sessionKey,
    settledAt: options.settledAt,
    placeName: draw.place.name,
    lat: draw.place.lat,
    lon: draw.place.lon,
    name: null,
    story: reveal.story,
    bornYear: reveal.life.year,
    deathYear: reveal.life.deathYear,
    age: reveal.life.age,
    sex: reveal.life.sex,
    sin: sinsOf(reveal.life).map((sin) => sin.phrase).join("; ") || null,
    wager,
    fees,
    net: reveal.net,
    roundNet: reveal.net - fees,
    skill: reveal.skill,
    bets: reveal.results.map(({ marketId, marketLabel, pickLabel, outcomeLabel, won, stake, net, odds }) => ({
      marketId,
      marketLabel,
      pickLabel,
      outcomeLabel,
      won,
      stake,
      net,
      odds,
    })),
  };
}

/** Puts the newest round first, replacing any earlier record of the same round and dropping the oldest past the cap. */
export function addEntry(entries: BetHistoryEntry[], entry: BetHistoryEntry): BetHistoryEntry[] {
  return [entry, ...entries.filter((existing) => existing.id !== entry.id)].slice(0, MAX_HISTORY_ENTRIES);
}

function isEntry(value: unknown): value is BetHistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  return (
    "id" in value &&
    typeof value.id === "string" &&
    "settledAt" in value &&
    typeof value.settledAt === "number" &&
    "roundNet" in value &&
    typeof value.roundNet === "number" &&
    "bets" in value &&
    Array.isArray(value.bets)
  );
}

export function readHistory(key: string): BetHistoryEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
  } catch {
    return [];
  }
}

export function recordRound(key: string, entry: BetHistoryEntry): void {
  try {
    localStorage.setItem(key, JSON.stringify(addEntry(readHistory(key), entry)));
  } catch {
    /* storage unavailable: the round still plays, it just isn't kept in the history */
  }
}

/** Fills in the AI-written story and soul name once they land, after the round was first recorded. */
export function patchRound(key: string, id: string, patch: Pick<BetHistoryEntry, "story" | "name">): void {
  try {
    const entries = readHistory(key).map((entry) => (entry.id === id ? { ...entry, ...patch } : entry));
    localStorage.setItem(key, JSON.stringify(entries));
  } catch {
    /* storage unavailable: the history keeps the local story */
  }
}
