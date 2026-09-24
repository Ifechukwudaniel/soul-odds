import {
  toConfiguration,
  toConfigurationInput,
  type SoulConfigurationDefinition,
} from '@chain/soul-odds-engine/configuration';
// ✦ Imported from the `soul`/`configuration` subpaths, not the package root: the root barrel
//   re-exports `title.ts`, which reads title files via `node:fs` and would drag a Node built-in into
//   the browser bundle, where Turbopack refuses to chunk it.
import {
  encodePrediction,
  type SoulConfiguration,
  type SoulMatchBreakdown,
  type SoulPrediction,
  type SoulResult,
  crimeOdds,
  genderOdds,
  lifespanOdds,
  validCrimeMasks,
} from '@chain/soul-odds-engine/soul';
import { decodeAbiParameters, type Hex } from 'viem';
import titleFile from '@/config/mortal-odds/soul-odds-title.json';
import { chanceTag } from '@/lib/mortal-odds/pricing';
import {
  categoriesOfCrimeMask,
  crimeMaskOfSinOption,
  sinOptionId,
} from '@/lib/mortal-odds/sin-selection';
import type { Bet, Price } from '@/types';

// =====================================
// ⬢ Era configurations
// =====================================
const definitions = titleFile.betConfigurations as SoulConfigurationDefinition[];

/**
 * Every era configuration the deployed title carries (see `soul-odds-title.json`). The engine picks
 * one uniformly at random per session (`pickConfigurationIndex`), so the preview averages across
 * all of them instead of assuming one.
 */
export const soulOddsConfigurations: SoulConfiguration[] = definitions.map((definition) =>
  toConfiguration(toConfigurationInput(definition)),
);

/**
 * The era configuration the contract fixed for a session, read from its `gameState` while it waits
 * for the player's prediction. Null when the state doesn't hold one.
 */
export function configurationIndexFromGameState(gameState: Hex): number | null {
  try {
    const [index] = decodeAbiParameters([{ type: 'uint256' }], gameState);
    return index < BigInt(soulOddsConfigurations.length) ? Number(index) : null;
  } catch {
    return null;
  }
}

/** The one configuration a session is pinned to, or every era when it isn't known yet. */
function configurationsFor(configurationIndex: number | null): SoulConfiguration[] {
  const pinned =
    configurationIndex === null ? undefined : soulOddsConfigurations[configurationIndex];
  return pinned ? [pinned] : soulOddsConfigurations;
}

// =====================================
// ⬢ Prediction
// =====================================

/** Index-aligned with `soul-odds-title.json`'s `lifespans`, and with the "age" market's option order. */
export const AGE_BUCKET_ORDER = ['u5', 'y', 'm', 'o'] as const;

const WAD = 10n ** 18n;

export function ageBucketIndex(optionId: string): number {
  const index = AGE_BUCKET_ORDER.indexOf(optionId as (typeof AGE_BUCKET_ORDER)[number]);
  if (index === -1) throw new Error(`Unknown age bucket "${optionId}"`);
  return index;
}

/** Builds the on-chain prediction from the player's three choice bets (sex, age, sins-category). */
export function buildPrediction(bets: Record<string, Bet>): SoulPrediction {
  const sexBet = bets.sex;
  const ageBet = bets.age;
  const sinsBet = bets.sins;
  if (sexBet?.kind !== 'choice' || ageBet?.kind !== 'choice' || sinsBet?.kind !== 'choice') {
    throw new Error('A prediction needs a sex, age and sins pick');
  }

  const gender = sexBet.optionId === 'girl' ? 1 : 0;
  const lifespanBucket = ageBucketIndex(ageBet.optionId);
  const crimeMask = crimeMaskOfSinOption(sinsBet.optionId);

  return { gender, lifespanBucket, sins: crimeMask !== 0, crimeMask };
}

export function encodeMortalOddsPrediction(bets: Record<string, Bet>): Hex {
  return encodePrediction(buildPrediction(bets));
}

// =====================================
// ⬢ Settlement
// =====================================
export const settledGameStateAbi = [
  {
    type: 'tuple',
    components: [
      { type: 'uint8', name: 'gender' },
      { type: 'uint8', name: 'lifespanBucket' },
      { type: 'bool', name: 'sins' },
      { type: 'uint8', name: 'crimeMask' },
    ],
  },
  {
    type: 'tuple',
    components: [
      { type: 'uint8', name: 'gender' },
      { type: 'uint16', name: 'age' },
      { type: 'int16', name: 'birthYear' },
      { type: 'uint8', name: 'lifespanBucket' },
      { type: 'uint8', name: 'crimeMask' },
    ],
  },
  { type: 'bool' },
  {
    type: 'tuple',
    components: [
      { type: 'bool', name: 'genderMatch' },
      { type: 'bool', name: 'lifespanMatch' },
      { type: 'bool', name: 'crimeMatch' },
    ],
  },
] as const;

// ✦ SessionPhase enum from ICasinoGameV2.sol
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

// =====================================
// ⬢ Pricing
// =====================================

/** The contract stakes an equal third of the wager on each of the three categories. */
const CATEGORY_COUNT = 3n;

/**
 * The price for one option. Each category stakes a third of the wager and pays `payout` on a hit,
 * so the multiplier is `payout / (wager / 3)`, exactly `rtp / p`.
 *
 * With the session's era known there is one configuration and the price is exact. Before that the
 * era is picked uniformly at random, so the multiplier is each era's multiplier weighted by its
 * chance, over the average chance. Averaging the multipliers directly would let one rare era (475x
 * at 0.2%) dominate a bet that is 9.5% likely on average.
 */
function averagePrice(
  wager: bigint,
  perConfigurationOdds: { probabilityWad: bigint; payout: bigint }[],
): Price {
  const chances = perConfigurationOdds.map((odds) => Number(odds.probabilityWad) / 1e18);
  const p = chances.reduce((sum, chance) => sum + chance, 0) / chances.length;
  const returned = perConfigurationOdds.reduce(
    (sum, odds, i) =>
      sum + (chances[i] ?? 0) * (Number(odds.payout * CATEGORY_COUNT) / Number(wager)),
    0,
  );
  const odds = wager === 0n || p === 0 ? null : returned / chances.length / p;
  return { p, odds, tag: chanceTag(p) };
}

/**
 * Live odds for every crime state the contract accepts (none, each category, each pair) for one
 * lifespan bucket. Each bucket has its own `noCrimeWeight` (a child is far likelier to be "Clean"),
 * so these only mean something once an age bucket is picked.
 */
export function previewSinsPrices(
  wager: bigint,
  lifespanBucket: number,
  configurationIndex: number | null = null,
): Record<string, Price> {
  const previewWager = wager > 0n ? wager : WAD;
  const configurations = configurationsFor(configurationIndex);
  const sins: Record<string, Price> = {};
  for (const crimeMask of validCrimeMasks()) {
    sins[sinOptionId(categoriesOfCrimeMask(crimeMask))] = averagePrice(
      previewWager,
      configurations.map((configuration) =>
        crimeOdds(configuration, previewWager, lifespanBucket, crimeMask),
      ),
    );
  }
  return sins;
}

/** Live odds preview for each of the three predictable categories, for the session's era when known and averaged across every era otherwise. */
export function previewCategoryPrices(
  wager: bigint,
  lifespanBucket = 0,
  configurationIndex: number | null = null,
): { sex: Record<string, Price>; age: Record<string, Price>; sins: Record<string, Price> } {
  const previewWager = wager > 0n ? wager : WAD;
  const configurations = configurationsFor(configurationIndex);

  const sex: Record<string, Price> = {};
  for (const [optionId, gender] of [['girl', 1] as const, ['boy', 0] as const]) {
    sex[optionId] = averagePrice(
      previewWager,
      configurations.map((configuration) => genderOdds(configuration, previewWager, gender)),
    );
  }

  const age: Record<string, Price> = {};
  AGE_BUCKET_ORDER.forEach((optionId, index) => {
    age[optionId] = averagePrice(
      previewWager,
      configurations.map((configuration) => lifespanOdds(configuration, previewWager, index)),
    );
  });

  return { sex, age, sins: previewSinsPrices(previewWager, lifespanBucket, configurationIndex) };
}

/** Reshapes a `previewCategoryPrices` result into the plain-probability records `resolveBets` scores skill against. */
export function toTrueProbabilities(
  prices: ReturnType<typeof previewCategoryPrices>,
): Record<string, Record<string, number>> {
  return {
    sex: Object.fromEntries(Object.entries(prices.sex).map(([id, price]) => [id, price.p])),
    age: Object.fromEntries(Object.entries(prices.age).map(([id, price]) => [id, price.p])),
    sins: Object.fromEntries(Object.entries(prices.sins).map(([id, price]) => [id, price.p])),
  };
}
