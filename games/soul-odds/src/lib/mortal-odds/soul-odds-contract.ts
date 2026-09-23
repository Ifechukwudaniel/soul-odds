import { decodeAbiParameters, type Hex } from "viem";
// Imported from the specific `soul`/`configuration` subpaths, not the package root: the root
// barrel also re-exports `title.ts`, which reads title files via `node:fs` — fine server-side,
// but it drags a Node built-in into this file's browser bundle and Turbopack refuses to chunk it.
import {
  encodePrediction,
  type SoulConfiguration,
  type SoulMatchBreakdown,
  type SoulPrediction,
  type SoulResult,
  crimeOdds,
  genderOdds,
  lifespanOdds,
} from "@chain/soul-odds-engine/soul";
import {
  toConfiguration,
  toConfigurationInput,
  type SoulConfigurationDefinition,
} from "@chain/soul-odds-engine/configuration";
import { chanceTag } from "@/lib/mortal-odds/pricing";
import { SIN_CATEGORIES } from "@/lib/mortal-odds/config";
import type { SinCategoryId } from "@/lib/mortal-odds/config";
import titleFile from "@/config/mortal-odds/soul-odds-title.json";
import type { Bet, Price } from "@/types";

const definitions = titleFile.betConfigurations as SoulConfigurationDefinition[];

/**
 * Every era configuration the deployed title carries — see `soul-odds-title.json`. The engine
 * picks one of these uniformly at random per session (`pickConfigurationIndex`), so a single
 * prediction's real odds depend on which era it lands in; the preview below averages across all
 * of them instead of assuming a specific one.
 */
export const soulOddsConfigurations: SoulConfiguration[] = definitions.map((definition) =>
  toConfiguration(toConfigurationInput(definition)),
);

/** Index-aligned with `soul-odds-title.json`'s `lifespans`, and with the "age" market's option order. */
export const AGE_BUCKET_ORDER = ["u5", "y", "m", "o"] as const;

const WAD = 10n ** 18n;

export function ageBucketIndex(optionId: string): number {
  const index = AGE_BUCKET_ORDER.indexOf(optionId as (typeof AGE_BUCKET_ORDER)[number]);
  if (index === -1) throw new Error(`Unknown age bucket "${optionId}"`);
  return index;
}

function crimeCategoryIndex(categoryId: SinCategoryId): number {
  const index = SIN_CATEGORIES.findIndex((category) => category.id === categoryId);
  if (index === -1) throw new Error(`Unknown sin category "${categoryId}"`);
  return index;
}

/** Builds the on-chain prediction from the player's three choice bets (sex, age, sins-category). */
export function buildPrediction(bets: Record<string, Bet>): SoulPrediction {
  const sexBet = bets.sex;
  const ageBet = bets.age;
  const sinsBet = bets.sins;
  if (sexBet?.kind !== "choice" || ageBet?.kind !== "choice" || sinsBet?.kind !== "choice") {
    throw new Error("A prediction needs a sex, age and sins pick");
  }

  const gender = sexBet.optionId === "girl" ? 1 : 0;
  const lifespanBucket = ageBucketIndex(ageBet.optionId);
  const crimeMask = sinsBet.optionId === "none" ? 0 : 1 << crimeCategoryIndex(sinsBet.optionId as SinCategoryId);

  return { gender, lifespanBucket, sins: crimeMask !== 0, crimeMask };
}

export function encodeMortalOddsPrediction(bets: Record<string, Bet>): Hex {
  return encodePrediction(buildPrediction(bets));
}

export const settledGameStateAbi = [
  {
    type: "tuple",
    components: [
      { type: "uint8", name: "gender" },
      { type: "uint8", name: "lifespanBucket" },
      { type: "bool", name: "sins" },
      { type: "uint8", name: "crimeMask" },
    ],
  },
  {
    type: "tuple",
    components: [
      { type: "uint8", name: "gender" },
      { type: "uint16", name: "age" },
      { type: "int16", name: "birthYear" },
      { type: "uint8", name: "lifespanBucket" },
      { type: "uint8", name: "crimeMask" },
    ],
  },
  { type: "bool" },
  {
    type: "tuple",
    components: [
      { type: "bool", name: "genderMatch" },
      { type: "bool", name: "lifespanMatch" },
      { type: "bool", name: "crimeMatch" },
    ],
  },
] as const;

// SessionPhase enum from ICasinoGameV2.sol
const PHASE_SETTLED = 3;
const PHASE_FORFEITED = 4;
const PHASE_CANCELLED = 5;

export function isTerminalPhase(phase: number | undefined): boolean {
  return phase === PHASE_SETTLED || phase === PHASE_FORFEITED || phase === PHASE_CANCELLED;
}

export type SettledSoul = { result: SoulResult; won: boolean; breakdown: SoulMatchBreakdown };

/** Decodes a settled session's `gameState`, mirroring `example/frontend`'s reference decode. */
export function decodeSettledSoul(gameState: Hex): SettledSoul {
  const [, result, won, breakdown] = decodeAbiParameters(settledGameStateAbi, gameState);
  return { result, won, breakdown };
}

/** The category a matched crimeMask bit belongs to, or null when no crime slot is set. */
export function categoryFromCrimeMask(crimeMask: number): SinCategoryId | null {
  const index = SIN_CATEGORIES.findIndex((_category, bitIndex) => (crimeMask & (1 << bitIndex)) !== 0);
  return index === -1 ? null : (SIN_CATEGORIES[index]?.id ?? null);
}

/**
 * The preview price for one option, averaged equally across every era configuration: since the
 * engine picks a configuration uniformly at random before it samples anything, the expected
 * probability of an outcome — and the expected payout a wager earns for it — are each the plain
 * average of what every era would independently give. This is a preview only; whichever era the
 * chain actually draws decides the real, on-chain payout at settlement.
 */
function averagePrice(wager: bigint, perConfigurationOdds: { probabilityWad: bigint; payout: bigint }[]): Price {
  const count = perConfigurationOdds.length;
  const p = perConfigurationOdds.reduce((sum, odds) => sum + Number(odds.probabilityWad) / 1e18, 0) / count;
  const odds =
    wager === 0n ? null : perConfigurationOdds.reduce((sum, o) => sum + Number(o.payout) / Number(wager), 0) / count;
  return { p, odds, tag: chanceTag(p) };
}

/**
 * Live crime-category odds for one specific lifespan bucket: each bucket carries its own
 * `noCrimeWeight` (a child is far likelier to be "Clean" than an adult), so "Sins committed"
 * odds are only meaningful once an age bucket is actually picked — passing the wrong one wildly
 * over- or under-states the payout (a bucket-0/child default made "Heresy" preview at ~1000x
 * regardless of the age the player went on to pick).
 */
export function previewSinsPrices(wager: bigint, lifespanBucket: number): Record<string, Price> {
  const previewWager = wager > 0n ? wager : WAD;
  const sins: Record<string, Price> = {};
  sins.none = averagePrice(
    previewWager,
    soulOddsConfigurations.map((configuration) => crimeOdds(configuration, previewWager, lifespanBucket, 0)),
  );
  SIN_CATEGORIES.forEach((category, index) => {
    sins[category.id] = averagePrice(
      previewWager,
      soulOddsConfigurations.map((configuration) =>
        crimeOdds(configuration, previewWager, lifespanBucket, 1 << index),
      ),
    );
  });
  return sins;
}

/** Live odds preview for each of the three predictable categories, averaged across every era configuration. */
export function previewCategoryPrices(
  wager: bigint,
  lifespanBucket = 0,
): { sex: Record<string, Price>; age: Record<string, Price>; sins: Record<string, Price> } {
  const previewWager = wager > 0n ? wager : WAD;

  const sex: Record<string, Price> = {};
  for (const [optionId, gender] of [["girl", 1] as const, ["boy", 0] as const]) {
    sex[optionId] = averagePrice(
      previewWager,
      soulOddsConfigurations.map((configuration) => genderOdds(configuration, previewWager, gender)),
    );
  }

  const age: Record<string, Price> = {};
  AGE_BUCKET_ORDER.forEach((optionId, index) => {
    age[optionId] = averagePrice(
      previewWager,
      soulOddsConfigurations.map((configuration) => lifespanOdds(configuration, previewWager, index)),
    );
  });

  return { sex, age, sins: previewSinsPrices(previewWager, lifespanBucket) };
}

/** Reshapes a `previewCategoryPrices` result into the plain-probability records `resolveBets` scores skill against. */
export function toTrueProbabilities(prices: ReturnType<typeof previewCategoryPrices>): Record<string, Record<string, number>> {
  return {
    sex: Object.fromEntries(Object.entries(prices.sex).map(([id, price]) => [id, price.p])),
    age: Object.fromEntries(Object.entries(prices.age).map(([id, price]) => [id, price.p])),
    sins: Object.fromEntries(Object.entries(prices.sins).map(([id, price]) => [id, price.p])),
  };
}
