import * as z from "zod";
import type { RevealResult } from "@/hooks/useMortalOddsDraw";
import { sinsOf } from "@/lib/mortal-odds/sin-selection";
import type { Draw, RoundCharge } from "@/types";

const betHistoryBetSchema = z.object({
  marketId: z.string(),
  marketLabel: z.string(),
  pickLabel: z.string(),
  outcomeLabel: z.string(),
  won: z.boolean(),
  stake: z.number(),
  net: z.number(),
  odds: z.number(),
});

/** One settled round: the soul that was drawn, every bet placed on it and how the money moved. */
export const betHistoryEntrySchema = z.object({
  id: z.string().min(1).max(128),
  settledAt: z.number(),
  /** Where the soul lived. Kept for future use; not shown in the history. */
  placeName: z.string().max(255),
  lat: z.number(),
  lon: z.number(),
  name: z.string().max(60).nullable(),
  story: z.string(),
  bornYear: z.number().int(),
  deathYear: z.number().int(),
  age: z.number().int(),
  sex: z.enum(["girl", "boy"]),
  sin: z.string().nullable(),
  /** The round's locked wager. */
  wager: z.number(),
  /** Redraw fees paid on top of the wager. */
  fees: z.number(),
  /** What the bets returned; the wager is already reflected in it. */
  net: z.number(),
  /** `net` after fees. */
  roundNet: z.number(),
  skill: z.number(),
  bets: z.array(betHistoryBetSchema),
});

export type BetHistoryBet = z.infer<typeof betHistoryBetSchema>;
export type BetHistoryEntry = z.infer<typeof betHistoryEntrySchema>;

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
