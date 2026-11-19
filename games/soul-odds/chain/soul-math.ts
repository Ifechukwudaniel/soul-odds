// Exact Soul Odds odds, shared by the chain title (title.ts) and the frontend.
//
// ⬢ Pure bigint with no imports beyond the two JSON files: the platform's title compiler loads it.
//   Everything that hashes lives in soul-settle.ts.
//
// A round has three categories the player predicts, each staking a third of the wager and paying
// `wager / 3 * RTP / p` on a hit, where p is that category's TRUE probability in the era. Because
// every category is priced from its own true odds, the expected return is exactly the RTP whatever
// the prediction is. (The old contract priced the crime category from the predicted lifespan
// bucket's odds instead, which returned anywhere from 65% to 115% depending on the pick.)
import titleFile from '../src/config/mortal-odds/soul-odds-title.json';
import crimeMaskFile from './era-crime-masks.json';

export type Fraction = { n: bigint; d: bigint };

export const GENDER_MATCH = 1;
export const LIFESPAN_MATCH = 2;
export const CRIME_MATCH = 4;

const BPS = 10_000n;
const UINT32_MAX = 2n ** 32n - 1n;
/** Every era table's weights sum to this, miss included. */
export const TABLE_WEIGHT = 4_000_000_000n;

/** Every crime state a soul can be in, in the order the prediction index counts them. */
export const CRIME_MASKS = [0, 1, 2, 4, 8, 3, 5, 9, 6, 10, 12] as const;
export const PREDICTION_COUNT = 2 * 4 * CRIME_MASKS.length;

export type Prediction = { gender: number; lifespanBucket: number; crimeMask: number };

export type Era = {
  name: string;
  genderWeights: readonly [bigint, bigint];
  genderTotal: bigint;
  lifespanWeights: readonly bigint[];
  lifespanTotal: bigint;
  lifespanYears: readonly { minYears: number; maxYears: number }[];
  noCrimeWeights: readonly bigint[];
  maskCounts: ReadonlyMap<number, bigint>;
  maskDenominator: bigint;
  rtp: Fraction;
};

type TitleEra = (typeof titleFile.betConfigurations)[number];

function parseRtp(value: string): Fraction {
  const [whole = '0', fraction = ''] = value.split('.');
  return { n: BigInt(whole + fraction), d: 10n ** BigInt(fraction.length) };
}

function buildEra(definition: TitleEra): Era {
  const masks = (
    crimeMaskFile as Record<string, { denominator: string; counts: Record<string, string> }>
  )[definition.name];
  if (!masks)
    throw new Error(
      `era-crime-masks.json has no entry for "${definition.name}"; run pnpm run generate:crime-masks`,
    );
  return {
    name: definition.name,
    genderWeights: [BigInt(definition.maleWeight), BigInt(definition.femaleWeight)],
    genderTotal: BigInt(definition.maleWeight + definition.femaleWeight),
    lifespanWeights: definition.lifespans.map((lifespan) => BigInt(lifespan.weight)),
    lifespanTotal: BigInt(definition.lifespans.reduce((sum, lifespan) => sum + lifespan.weight, 0)),
    lifespanYears: definition.lifespans.map(({ minYears, maxYears }) => ({ minYears, maxYears })),
    noCrimeWeights: definition.lifespans.map((lifespan) => BigInt(lifespan.noCrimeWeight)),
    maskCounts: new Map(
      Object.entries(masks.counts).map(([mask, count]) => [Number(mask), BigInt(count)]),
    ),
    maskDenominator: BigInt(masks.denominator),
    rtp: parseRtp(definition.rtpWad),
  };
}

export const ERAS: readonly Era[] = titleFile.betConfigurations.map(buildEra);

// =====================================
// ⬢ Predictions
// =====================================

export function predictionFromIndex(index: number): Prediction {
  if (!Number.isInteger(index) || index < 0 || index >= PREDICTION_COUNT) {
    throw new RangeError(`Prediction index out of range: ${index}`);
  }
  const maskIndex = index % CRIME_MASKS.length;
  const rest = Math.floor(index / CRIME_MASKS.length);
  return {
    gender: Math.floor(rest / 4),
    lifespanBucket: rest % 4,
    crimeMask: CRIME_MASKS[maskIndex]!,
  };
}

export function predictionIndex({ gender, lifespanBucket, crimeMask }: Prediction): number {
  const maskIndex = CRIME_MASKS.indexOf(crimeMask as (typeof CRIME_MASKS)[number]);
  if (maskIndex === -1 || gender < 0 || gender > 1 || lifespanBucket < 0 || lifespanBucket > 3) {
    throw new RangeError('Not a valid prediction');
  }
  return (gender * 4 + lifespanBucket) * CRIME_MASKS.length + maskIndex;
}

// =====================================
// ⬢ Exact probabilities
// =====================================

/** P(lifespan = l and crime state = mask) over `lifespanTotal * 10000 * maskDenominator`. */
export function jointMass(era: Era, lifespan: number, mask: number): bigint {
  const weight = era.lifespanWeights[lifespan]!;
  const noCrime = era.noCrimeWeights[lifespan]!;
  return mask === 0
    ? weight * noCrime * era.maskDenominator
    : weight * (BPS - noCrime) * (era.maskCounts.get(mask) ?? 0n);
}

const crimeBase = (era: Era) => era.lifespanTotal * BPS * era.maskDenominator;

export function genderProbability(era: Era, gender: number): Fraction {
  return { n: era.genderWeights[gender]!, d: era.genderTotal };
}

export function lifespanProbability(era: Era, bucket: number): Fraction {
  return { n: era.lifespanWeights[bucket]!, d: era.lifespanTotal };
}

/** The chance a soul's crime state is `mask`, over every lifespan bucket. */
export function crimeProbability(era: Era, mask: number): Fraction {
  let mass = 0n;
  for (let bucket = 0; bucket < 4; bucket++) mass += jointMass(era, bucket, mask);
  return { n: mass, d: crimeBase(era) };
}

const toNumber = ({ n, d }: Fraction) => Number((n * 10n ** 18n) / d) / 1e18;
export const probabilityNumber = toNumber;

// =====================================
// ⬢ One prediction's table
// =====================================

export type Tier = {
  /** Which categories hit: `GENDER_MATCH | LIFESPAN_MATCH | CRIME_MATCH`, or 0 for a miss. */
  flags: number;
  /** Chance within the era, exact. */
  probability: Fraction;
  /** Multiple of the wager, exact. */
  prize: Fraction;
};

export function predictionTiers(era: Era, prediction: Prediction): Tier[] {
  const categories = [
    genderProbability(era, prediction.gender),
    lifespanProbability(era, prediction.lifespanBucket),
    crimeProbability(era, prediction.crimeMask),
  ];
  if (categories.some((category) => category.n === 0n)) {
    throw new Error(`Prediction can never hit in era ${era.name}`);
  }
  // Each matched category pays wager / 3 * RTP / p.
  const share = categories.map((p): Fraction => ({ n: era.rtp.n * p.d, d: era.rtp.d * 3n * p.n }));

  const base = era.genderTotal * crimeBase(era);
  const mass = new Map<number, bigint>();
  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < 4; bucket++) {
      for (const mask of CRIME_MASKS) {
        const flags =
          (gender === prediction.gender ? GENDER_MATCH : 0) |
          (bucket === prediction.lifespanBucket ? LIFESPAN_MATCH : 0) |
          (mask === prediction.crimeMask ? CRIME_MATCH : 0);
        mass.set(
          flags,
          (mass.get(flags) ?? 0n) + era.genderWeights[gender]! * jointMass(era, bucket, mask),
        );
      }
    }
  }

  const tiers: Tier[] = [];
  for (const [flags, weight] of [...mass].sort((a, b) => a[0] - b[0])) {
    if (weight === 0n) continue;
    let prize: Fraction = { n: 0n, d: 1n };
    for (let i = 0; i < 3; i++) {
      if ((flags & (1 << i)) !== 0) {
        prize = { n: prize.n * share[i]!.d + share[i]!.n * prize.d, d: prize.d * share[i]!.d };
      }
    }
    tiers.push({ flags, probability: { n: weight, d: base }, prize });
  }
  return tiers;
}

// =====================================
// ⬢ On-chain table
// =====================================

function largestPrize(): Fraction {
  let top: Fraction = { n: 0n, d: 1n };
  for (const era of ERAS) {
    for (let index = 0; index < PREDICTION_COUNT; index++) {
      for (const { prize } of predictionTiers(era, predictionFromIndex(index))) {
        if (prize.n * top.d > top.n * prize.d) top = prize;
      }
    }
  }
  return top;
}

let denominator: bigint | undefined;

/** Prizes are multiples of the wager in units of 1 / this. As fine as a 32-bit top prize allows. */
export function prizeDenominator(): bigint {
  if (denominator === undefined) {
    const top = largestPrize();
    const ceiling = top.n / top.d + 1n;
    denominator = UINT32_MAX / ceiling;
    if (denominator > 1_000_000n) denominator = 1_000_000n;
  }
  return denominator;
}

export type TableTier = { flags: number; prizeUnits: bigint; weight: bigint };

const tableCache = new Map<string, TableTier[]>();

/** The settlement table one era draws for one prediction. Weights sum to `TABLE_WEIGHT`; a miss is `flags` 0. */
export function predictionTable(eraIndex: number, index: number): TableTier[] {
  const key = `${eraIndex}:${index}`;
  const cached = tableCache.get(key);
  if (cached) return cached;

  const era = ERAS[eraIndex];
  if (!era) throw new RangeError(`Unknown era ${eraIndex}`);
  const unit = prizeDenominator();
  const tiers = predictionTiers(era, predictionFromIndex(index));

  const table: TableTier[] = tiers.map(({ flags, probability, prize }) => ({
    flags,
    prizeUnits: (prize.n * unit) / prize.d,
    weight: (() => {
      const weight = (probability.n * TABLE_WEIGHT) / probability.d;
      return weight === 0n ? 1n : weight;
    })(),
  }));

  const winning = table.filter((tier) => tier.flags !== 0);
  const missTier = table.find((tier) => tier.flags === 0);
  const winningWeight = winning.reduce((sum, tier) => sum + tier.weight, 0n);
  if (winningWeight >= TABLE_WEIGHT) throw new Error('Winning weights fill the whole table');
  if (missTier) missTier.weight = TABLE_WEIGHT - winningWeight;
  else table.unshift({ flags: 0, prizeUnits: 0n, weight: TABLE_WEIGHT - winningWeight });

  // Flooring prizes and rounding weights can nudge the return above the RTP; trim the biggest
  // contributor until it is not, so the title never exceeds its declared RTP.
  const returned = () => table.reduce((sum, tier) => sum + tier.prizeUnits * tier.weight, 0n);
  while (returned() * era.rtp.d > era.rtp.n * unit * TABLE_WEIGHT) {
    const top = table.reduce((best, tier) =>
      tier.prizeUnits * tier.weight > best.prizeUnits * best.weight ? tier : best,
    );
    top.prizeUnits -= 1n;
  }

  table.sort((a, b) => a.flags - b.flags);
  tableCache.set(key, table);
  return table;
}
