import { encodeAbiParameters, type Hex } from 'viem';
import { chanceTag } from '@/lib/mortal-odds/pricing';
import {
  categoriesOfCrimeMask,
  crimeMaskOfSinOption,
  sinOptionId,
} from '@/lib/mortal-odds/sin-selection';
import type { Bet, Price } from '@/types';
import {
  CRIME_MASKS,
  CRIME_MATCH,
  crimeProbability,
  type Era,
  ERAS,
  type Fraction,
  GENDER_MATCH,
  genderProbability,
  LIFESPAN_MATCH,
  lifespanProbability,
  predictionIndex,
} from '../../../chain/soul-math';
import { deriveSoul, eraFromWord, settleTier } from '../../../chain/soul-settle';

// =====================================
// ⬢ Eras
// =====================================

/** Which of the three categories a prediction pairs with the soul: sex, lifespan bucket, crime state. */
export type SoulPrediction = {
  gender: number;
  lifespanBucket: number;
  sins: boolean;
  crimeMask: number;
};

export type SoulMatchBreakdown = {
  genderMatch: boolean;
  lifespanMatch: boolean;
  crimeMatch: boolean;
};

type SessionRaw = {
  randomness?: Hex;
  randomnessRequests?: { nonce: string; randomness?: Hex; fulfilled: boolean }[];
};

/** Every fulfilled VRF word of a session in step order: the first picks the era, the last settles the round. */
export function randomnessWords(raw: SessionRaw): Hex[] {
  const fulfilled = (raw.randomnessRequests ?? [])
    .filter((request) => request.fulfilled && request.randomness)
    .sort((a, b) => Number(BigInt(a.nonce) - BigInt(b.nonce)))
    .map((request) => request.randomness!);
  return fulfilled.length > 0 ? fulfilled : raw.randomness ? [raw.randomness] : [];
}

/**
 * The era the title drew for a session, read from the VRF word that opened it. The title's first
 * node is a chance over the eras, so the era is fixed before any prediction and is known while the
 * session waits for the player. Null until that word has arrived.
 */
export function configurationIndexFromSession(raw: SessionRaw): number | null {
  const [first] = randomnessWords(raw);
  return first ? eraFromWord(first) : null;
}

/** The one era a session is pinned to, or every era when it isn't known yet. */
function erasFor(configurationIndex: number | null): readonly Era[] {
  const pinned = configurationIndex === null ? undefined : ERAS[configurationIndex];
  return pinned ? [pinned] : ERAS;
}

type CategoryOdds = { probabilityWad: bigint; payout: bigint };

/**
 * One category's odds and payout in one era. Each category stakes a third of the wager and pays
 * `wager / 3 * RTP / p`, rounded up to a whole unit, where p is the category's true chance.
 *
 * ✦ The crime category is priced from the chance a soul has that crime state over every lifespan
 *   bucket, so every category returns exactly the RTP. Pricing it from the predicted bucket's own
 *   chance, as the Soul Odds engine did, let some picks return up to 115%.
 */
function categoryOdds(era: Era, wager: bigint, probability: Fraction): CategoryOdds {
  const probabilityWad = (probability.n * WAD) / probability.d;
  if (probabilityWad === 0n) return { probabilityWad, payout: 0n };
  const rtpWad = (era.rtp.n * WAD) / era.rtp.d;
  const product = wager * rtpWad;
  return { probabilityWad, payout: (product - 1n) / (probabilityWad * CATEGORY_COUNT) + 1n };
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

/** The decision node's action: the prediction's index among the title's 88, as a uint256. */
export function encodeMortalOddsPrediction(bets: Record<string, Bet>): Hex {
  const { gender, lifespanBucket, crimeMask } = buildPrediction(bets);
  return encodeAbiParameters(
    [{ type: 'uint256' }],
    [BigInt(predictionIndex({ gender, lifespanBucket, crimeMask }))],
  );
}

// =====================================
// ⬢ Settlement
// =====================================
// ✦ SessionPhase enum from ICasinoGameV2.sol
const PHASE_SETTLED = 3;
const PHASE_FORFEITED = 4;
const PHASE_CANCELLED = 5;

export function isTerminalPhase(phase: number | undefined): boolean {
  return phase === PHASE_SETTLED || phase === PHASE_FORFEITED || phase === PHASE_CANCELLED;
}

export type SettledSoul = {
  result: { gender: number; age: number; lifespanBucket: number; crimeMask: number };
  won: boolean;
  breakdown: SoulMatchBreakdown;
};

/**
 * Reads a settled round. The chain settles which of the three categories hit (the settling tier's
 * label); the soul shown is one that hit exactly those, seeded by the round's own VRF word.
 * Throws when the round's randomness is not available yet.
 */
export function decodeSettledSoul(
  raw: SessionRaw,
  prediction: SoulPrediction,
  eraIndex: number,
): SettledSoul {
  const words = randomnessWords(raw);
  const settling = words.length > 1 ? words[words.length - 1] : undefined;
  if (!settling) throw new Error('The round has not been settled with randomness yet.');

  const index = predictionIndex(prediction);
  const tier = settleTier(eraIndex, index, settling);
  return {
    result: deriveSoul(eraIndex, prediction, tier.flags, settling),
    won: tier.prizeUnits > 0n,
    breakdown: {
      genderMatch: (tier.flags & GENDER_MATCH) !== 0,
      lifespanMatch: (tier.flags & LIFESPAN_MATCH) !== 0,
      crimeMatch: (tier.flags & CRIME_MATCH) !== 0,
    },
  };
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
 * Live odds for every crime state the title accepts (none, each category, each pair). The crime
 * price no longer depends on the age bucket picked, so `lifespanBucket` is kept only so callers
 * and the options' order stay as they were.
 */
export function previewSinsPrices(
  wager: bigint,
  _lifespanBucket: number,
  configurationIndex: number | null = null,
): Record<string, Price> {
  const previewWager = wager > 0n ? wager : WAD;
  const eras = erasFor(configurationIndex);
  const sins: Record<string, Price> = {};
  for (const crimeMask of CRIME_MASKS) {
    sins[sinOptionId(categoriesOfCrimeMask(crimeMask))] = averagePrice(
      previewWager,
      eras.map((era) => categoryOdds(era, previewWager, crimeProbability(era, crimeMask))),
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
  const eras = erasFor(configurationIndex);

  const sex: Record<string, Price> = {};
  for (const [optionId, gender] of [['girl', 1] as const, ['boy', 0] as const]) {
    sex[optionId] = averagePrice(
      previewWager,
      eras.map((era) => categoryOdds(era, previewWager, genderProbability(era, gender))),
    );
  }

  const age: Record<string, Price> = {};
  AGE_BUCKET_ORDER.forEach((optionId, index) => {
    age[optionId] = averagePrice(
      previewWager,
      eras.map((era) => categoryOdds(era, previewWager, lifespanProbability(era, index))),
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
