import { encodeAbiParameters, type Hex, hexToBigInt, keccak256, numberToHex } from 'viem';

export const SOUL_ERAS = [
  'Paleolithic',
  'Agrarian',
  'Medieval',
  'Renaissance',
  'EarlyModern',
  'Industrial',
  'Modern',
  'Contemporary',
] as const;
export type SoulEraName = (typeof SOUL_ERAS)[number];

export type SoulLifespan = { minYears: number; maxYears: number; weight: bigint; noCrimeWeight: bigint };
export type SoulCrime = { selectionWeight: bigint; commitWeight: bigint };
export type SoulConfiguration = {
  era: number;
  minBirthYear: number;
  maxBirthYear: number;
  lifespanTotalWeight: bigint;
  maleWeight: bigint;
  femaleWeight: bigint;
  rtpWad: bigint;
  lifespans: readonly [SoulLifespan, SoulLifespan, SoulLifespan, SoulLifespan];
  crimes: readonly [SoulCrime, SoulCrime, SoulCrime, SoulCrime];
};

export type SoulPrediction = { gender: number; lifespanBucket: number; sins: boolean; crimeMask: number };
export type SoulResult = {
  gender: number;
  age: number;
  birthYear: number;
  lifespanBucket: number;
  crimeMask: number;
};
export type SoulMatchBreakdown = { genderMatch: boolean; lifespanMatch: boolean; crimeMatch: boolean };

const WAD = 10n ** 18n;
const BPS = 10_000n;
const CRIME_COUNT = 4;
const LIFESPAN_COUNT = 4;

function mulDivFloor(a: bigint, b: bigint, denominator: bigint): bigint {
  return (a * b) / denominator;
}

function mulDivCeil(a: bigint, b: bigint, denominator: bigint): bigint {
  const product = a * b;
  return product === 0n ? 0n : (product - 1n) / denominator + 1n;
}

/** 3-byte action: gender, lifespanBucket, then flags = sins | (crimeMask << 1). Mirrors `_decodePrediction`. */
export function encodePrediction(prediction: SoulPrediction): Hex {
  const flags = (prediction.sins ? 1 : 0) | (prediction.crimeMask << 1);
  return numberToHex(
    (BigInt(prediction.gender) << 16n) | (BigInt(prediction.lifespanBucket) << 8n) | BigInt(flags),
    { size: 3 },
  );
}

export function decodePrediction(data: Hex): SoulPrediction {
  const value = hexToBigInt(data);
  const gender = Number((value >> 16n) & 0xffn);
  const lifespanBucket = Number((value >> 8n) & 0xffn);
  const flags = Number(value & 0xffn);
  return { gender, lifespanBucket, sins: (flags & 1) !== 0, crimeMask: flags >> 1 };
}

export function popcount4(mask: number): number {
  let count = 0;
  for (let i = 0; i < CRIME_COUNT; i++) if ((mask & (1 << i)) !== 0) count++;
  return count;
}

/** Mirrors `_validatePrediction`. Throws with the same shape of complaint the contract reverts with. */
export function validatePrediction(prediction: SoulPrediction): void {
  if (prediction.gender > 1) throw new Error('gender must be 0 or 1');
  if (prediction.lifespanBucket >= LIFESPAN_COUNT) throw new Error('lifespanBucket must be 0..3');
  if (prediction.crimeMask >= 1 << CRIME_COUNT) throw new Error('crimeMask must fit 4 bits');
  if (popcount4(prediction.crimeMask) > 2) throw new Error('at most two crimes may be predicted');
  if (prediction.sins !== (prediction.crimeMask !== 0)) {
    throw new Error('sins must equal whether any crime is predicted');
  }
}

/** Every valid crime state: no crime, each single crime, then every pair — mirrors `_validCrimeMasks`. */
export function validCrimeMasks(): number[] {
  const masks = [0];
  for (let i = 0; i < CRIME_COUNT; i++) masks.push(1 << i);
  for (let a = 0; a < CRIME_COUNT; a++) {
    for (let b = a + 1; b < CRIME_COUNT; b++) masks.push((1 << a) | (1 << b));
  }
  return masks;
}

function sampleGender(configuration: SoulConfiguration, random: bigint): number {
  const total = configuration.maleWeight + configuration.femaleWeight;
  const roll = random % total;
  return roll < configuration.maleWeight ? 0 : 1;
}

function lifespanAt(configuration: SoulConfiguration, bucket: number): SoulLifespan {
  const lifespan = configuration.lifespans[bucket];
  if (!lifespan) throw new RangeError(`Lifespan bucket out of range: ${bucket}`);
  return lifespan;
}

function crimeAt(configuration: SoulConfiguration, index: number): SoulCrime {
  const crime = configuration.crimes[index];
  if (!crime) throw new RangeError(`Crime index out of range: ${index}`);
  return crime;
}

function sampleLifespan(configuration: SoulConfiguration, random: bigint): number {
  const roll = random % configuration.lifespanTotalWeight;
  let cumulative = 0n;
  for (let i = 0; i < LIFESPAN_COUNT; i++) {
    cumulative += lifespanAt(configuration, i).weight;
    if (roll < cumulative) return i;
  }
  return 3;
}

function sampleAge(lifespan: SoulLifespan, random: bigint): number {
  if (lifespan.maxYears === lifespan.minYears) return lifespan.minYears;
  const span = BigInt(lifespan.maxYears - lifespan.minYears + 1);
  return lifespan.minYears + Number(random % span);
}

function sampleNoCrime(lifespan: SoulLifespan, random: bigint): boolean {
  return random % BPS < lifespan.noCrimeWeight;
}

function sampleBirthYear(configuration: SoulConfiguration, random: bigint): number {
  const { minBirthYear, maxBirthYear } = configuration;
  if (maxBirthYear === minBirthYear) return minBirthYear;
  const span = BigInt(maxBirthYear - minBirthYear + 1);
  return minBirthYear + Number(random % span);
}

function sampleCrimes(configuration: SoulConfiguration, random: bigint): number {
  let selectionTotal = 0n;
  for (let i = 0; i < CRIME_COUNT; i++) selectionTotal += crimeAt(configuration, i).selectionWeight;

  let mask = 0;
  const first = random % selectionTotal;
  let cumulative = 0n;
  for (let i = 0; i < CRIME_COUNT; i++) {
    cumulative += crimeAt(configuration, i).selectionWeight;
    if (first < cumulative) {
      mask |= 1 << i;
      break;
    }
  }

  const secondRandom = hexToBigInt(keccak256(encodeAbiParameters([{ type: 'uint256' }], [random])));
  const secondChance = secondRandom % BPS;
  if (secondChance < 2500n) {
    const second = secondRandom % selectionTotal;
    cumulative = 0n;
    for (let i = 0; i < CRIME_COUNT; i++) {
      cumulative += crimeAt(configuration, i).selectionWeight;
      if (second < cumulative && (mask & (1 << i)) === 0) {
        mask |= 1 << i;
        break;
      }
    }
  }
  return mask;
}

/** Mirrors `_generateSoul` bit-for-bit, including the `random >> 32/64/96/128` shifts per field. */
export function generateSoul(configuration: SoulConfiguration, randomness: Hex): SoulResult {
  const random = hexToBigInt(randomness);
  const gender = sampleGender(configuration, random);
  const lifespanBucket = sampleLifespan(configuration, random >> 32n);
  const lifespan = lifespanAt(configuration, lifespanBucket);
  const age = sampleAge(lifespan, random >> 64n);
  const noCrime = sampleNoCrime(lifespan, random >> 96n);
  const crimeMask = noCrime ? 0 : sampleCrimes(configuration, random >> 128n);

  // Flavor only, drawn from independent entropy — mirrors the `keccak256(abi.encode(randomness, 1))` salt.
  const birthYearRandom = hexToBigInt(
    keccak256(encodeAbiParameters([{ type: 'bytes32' }, { type: 'uint256' }], [randomness, 1n])),
  );
  const birthYear = sampleBirthYear(configuration, birthYearRandom);

  return { gender, age, birthYear, lifespanBucket, crimeMask };
}

/** Mirrors `_matchBreakdown`: which parts of `prediction` the generated soul actually matched. */
export function matchBreakdown(prediction: SoulPrediction, result: SoulResult): SoulMatchBreakdown {
  return {
    genderMatch: prediction.gender === result.gender,
    lifespanMatch: prediction.lifespanBucket === result.lifespanBucket,
    crimeMatch:
      prediction.sins === (result.crimeMask !== 0) && prediction.crimeMask === result.crimeMask,
  };
}

export function matchesPrediction(prediction: SoulPrediction, result: SoulResult): boolean {
  const breakdown = matchBreakdown(prediction, result);
  return breakdown.genderMatch && breakdown.lifespanMatch && breakdown.crimeMatch;
}

function crimeMaskIndices(crimeMask: number): number[] {
  const indices: number[] = [];
  for (let i = 0; i < CRIME_COUNT; i++) if ((crimeMask & (1 << i)) !== 0) indices.push(i);
  return indices;
}

function singleCrimeProbabilityWad(
  configuration: SoulConfiguration,
  selectionTotal: bigint,
  index: number,
): bigint {
  const probabilityWad = mulDivFloor(crimeAt(configuration, index).selectionWeight, WAD, selectionTotal);
  let stayedSingleWad = mulDivFloor(probabilityWad, 3n, 4n);
  if (index === CRIME_COUNT - 1) {
    stayedSingleWad += mulDivFloor(mulDivFloor(probabilityWad, probabilityWad, WAD), 1n, 4n);
  }
  return stayedSingleWad;
}

function pairCrimeProbabilityWad(
  configuration: SoulConfiguration,
  selectionTotal: bigint,
  first: number,
  second: number,
): bigint {
  const probabilityA = mulDivFloor(crimeAt(configuration, first).selectionWeight, WAD, selectionTotal);
  const probabilityB = mulDivFloor(crimeAt(configuration, second).selectionWeight, WAD, selectionTotal);
  let numeratorWad = mulDivFloor(probabilityA, probabilityB, WAD) * 2n;
  if (second === first + 1) numeratorWad += mulDivFloor(probabilityA, probabilityA, WAD);
  return numeratorWad / 4n;
}

function crimeMaskProbabilityWad(
  configuration: SoulConfiguration,
  selectionTotal: bigint,
  crimeMask: number,
): bigint {
  const [first, second] = crimeMaskIndices(crimeMask);
  if (first === undefined) throw new RangeError(`Crime mask has no crimes: ${crimeMask}`);
  return second === undefined
    ? singleCrimeProbabilityWad(configuration, selectionTotal, first)
    : pairCrimeProbabilityWad(configuration, selectionTotal, first, second);
}

function crimeStateProbabilityWad(
  configuration: SoulConfiguration,
  lifespan: SoulLifespan,
  crimeMask: number,
): bigint {
  if (crimeMask === 0) return mulDivFloor(lifespan.noCrimeWeight, WAD, BPS);
  const hasCrimeProbabilityWad = WAD - mulDivFloor(lifespan.noCrimeWeight, WAD, BPS);
  let selectionTotal = 0n;
  for (let i = 0; i < CRIME_COUNT; i++) selectionTotal += crimeAt(configuration, i).selectionWeight;
  const maskProbabilityWad = crimeMaskProbabilityWad(configuration, selectionTotal, crimeMask);
  return mulDivFloor(hasCrimeProbabilityWad, maskProbabilityWad, WAD);
}

type CategoryProbabilities = {
  genderProbabilityWad: bigint;
  lifespanProbabilityWad: bigint;
  crimeProbabilityWad: bigint;
};

/** Mirrors `_categoryProbabilities`: the three independent marginals `generateSoul` draws from. */
function categoryProbabilities(
  configuration: SoulConfiguration,
  prediction: SoulPrediction,
): CategoryProbabilities {
  const genderWeight = prediction.gender === 0 ? configuration.maleWeight : configuration.femaleWeight;
  const genderTotal = configuration.maleWeight + configuration.femaleWeight;
  const genderProbabilityWad = mulDivFloor(genderWeight, WAD, genderTotal);

  const lifespan = lifespanAt(configuration, prediction.lifespanBucket);
  const lifespanProbabilityWad = mulDivFloor(lifespan.weight, WAD, configuration.lifespanTotalWeight);

  const crimeProbabilityWad = crimeStateProbabilityWad(configuration, lifespan, prediction.crimeMask);

  return { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad };
}

/** Mirrors `_predictionProbabilityWad`: exact chance a random soul matches `prediction` on all three categories. */
export function predictionProbabilityWad(
  configuration: SoulConfiguration,
  prediction: SoulPrediction,
): bigint {
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } = categoryProbabilities(
    configuration,
    prediction,
  );
  return mulDivFloor(mulDivFloor(genderProbabilityWad, lifespanProbabilityWad, WAD), crimeProbabilityWad, WAD);
}

/**
 * Mirrors `_categoryPayout`: each category gets an equal third of `wager` and pays out at its OWN
 * odds, `(wager/3) * RTP / p_i`. A common category (e.g. gender) pays a small amount; a rare one
 * (e.g. an exact crime state) pays a large one.
 */
function categoryPayout(configuration: SoulConfiguration, wager: bigint, probabilityWad: bigint): bigint {
  if (probabilityWad === 0n) return 0n;
  return mulDivCeil(wager, configuration.rtpWad, probabilityWad * 3n);
}

export type CategoryOdds = { probabilityWad: bigint; payout: bigint };

/** Standalone odds/payout for picking `gender`, independent of the lifespan or crime pick. */
export function genderOdds(configuration: SoulConfiguration, wager: bigint, gender: number): CategoryOdds {
  const genderWeight = gender === 0 ? configuration.maleWeight : configuration.femaleWeight;
  const genderTotal = configuration.maleWeight + configuration.femaleWeight;
  const probabilityWad = mulDivFloor(genderWeight, WAD, genderTotal);
  return { probabilityWad, payout: categoryPayout(configuration, wager, probabilityWad) };
}

/** Standalone odds/payout for picking `lifespanBucket`, independent of the gender or crime pick. */
export function lifespanOdds(
  configuration: SoulConfiguration,
  wager: bigint,
  lifespanBucket: number,
): CategoryOdds {
  const lifespan = lifespanAt(configuration, lifespanBucket);
  const probabilityWad = mulDivFloor(lifespan.weight, WAD, configuration.lifespanTotalWeight);
  return { probabilityWad, payout: categoryPayout(configuration, wager, probabilityWad) };
}

/** Standalone odds/payout for `crimeMask` within `lifespanBucket` (crime odds depend on the bucket). */
export function crimeOdds(
  configuration: SoulConfiguration,
  wager: bigint,
  lifespanBucket: number,
  crimeMask: number,
): CategoryOdds {
  const lifespan = lifespanAt(configuration, lifespanBucket);
  const probabilityWad = crimeStateProbabilityWad(configuration, lifespan, crimeMask);
  return { probabilityWad, payout: categoryPayout(configuration, wager, probabilityWad) };
}

/**
 * Mirrors `_worstCaseCategoryProbabilities`: the marginal triple maximizing the total payout if all
 * three hit. Evaluated directly over every valid prediction since the crime marginal depends on
 * which bucket it's paired with.
 */
function worstCaseCategoryProbabilities(configuration: SoulConfiguration): CategoryProbabilities {
  let maxPayoutAtRefWager = -1n;
  let worst: CategoryProbabilities = {
    genderProbabilityWad: 0n,
    lifespanProbabilityWad: 0n,
    crimeProbabilityWad: 0n,
  };
  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < LIFESPAN_COUNT; bucket++) {
      for (const mask of validCrimeMasks()) {
        const probabilities = categoryProbabilities(configuration, {
          gender,
          lifespanBucket: bucket,
          sins: mask !== 0,
          crimeMask: mask,
        });
        const payoutAtRefWager =
          categoryPayout(configuration, WAD, probabilities.genderProbabilityWad) +
          categoryPayout(configuration, WAD, probabilities.lifespanProbabilityWad) +
          categoryPayout(configuration, WAD, probabilities.crimeProbabilityWad);
        if (payoutAtRefWager > maxPayoutAtRefWager) {
          maxPayoutAtRefWager = payoutAtRefWager;
          worst = probabilities;
        }
      }
    }
  }
  return worst;
}

/** Mirrors `_predictionMaxPayout`: what `wager` pays if `prediction` hits on all three categories. */
export function predictionMaxPayout(
  configuration: SoulConfiguration,
  wager: bigint,
  prediction: SoulPrediction,
): bigint {
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } = categoryProbabilities(
    configuration,
    prediction,
  );
  return (
    categoryPayout(configuration, wager, genderProbabilityWad) +
    categoryPayout(configuration, wager, lifespanProbabilityWad) +
    categoryPayout(configuration, wager, crimeProbabilityWad)
  );
}

/** Mirrors `_predictionPayout`: the actual partial-credit payout given the real generated soul. */
export function predictionPayout(
  configuration: SoulConfiguration,
  wager: bigint,
  prediction: SoulPrediction,
  result: SoulResult,
): bigint {
  const breakdown = matchBreakdown(prediction, result);
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } = categoryProbabilities(
    configuration,
    prediction,
  );
  let payout = 0n;
  if (breakdown.genderMatch) payout += categoryPayout(configuration, wager, genderProbabilityWad);
  if (breakdown.lifespanMatch) payout += categoryPayout(configuration, wager, lifespanProbabilityWad);
  if (breakdown.crimeMatch) payout += categoryPayout(configuration, wager, crimeProbabilityWad);
  return payout;
}

/** Probability of the full-house event at the riskiest prediction — mirrors `_minimumPredictionProbability`. */
export function minimumPredictionProbabilityWad(configuration: SoulConfiguration): bigint {
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } =
    worstCaseCategoryProbabilities(configuration);
  return mulDivFloor(mulDivFloor(genderProbabilityWad, lifespanProbabilityWad, WAD), crimeProbabilityWad, WAD);
}

/** Mirrors `_maxPayout`: the largest payout any prediction on this configuration could ever owe. */
export function maxPayout(configuration: SoulConfiguration, wager: bigint): bigint {
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } =
    worstCaseCategoryProbabilities(configuration);
  return (
    categoryPayout(configuration, wager, genderProbabilityWad) +
    categoryPayout(configuration, wager, lifespanProbabilityWad) +
    categoryPayout(configuration, wager, crimeProbabilityWad)
  );
}

/** Var(X_i * payout_i)/wager^2 for one Bernoulli(p_i) category — mirrors `_categoryVarianceTermWad`. */
function categoryVarianceTermWad(configuration: SoulConfiguration, probabilityWad: bigint): bigint {
  if (probabilityWad === 0n) return 0n;
  const ratioWad = mulDivCeil(configuration.rtpWad, WAD, probabilityWad * 3n);
  const ratioSquaredWad = mulDivCeil(ratioWad, ratioWad, WAD);
  const bernoulliVarianceWad = mulDivFloor(probabilityWad, WAD - probabilityWad, WAD);
  return mulDivCeil(ratioSquaredWad, bernoulliVarianceWad, WAD);
}

/** Mirrors `_varianceWad`: per-wager-squared variance of the total payout at the riskiest prediction. */
export function varianceWad(configuration: SoulConfiguration): bigint {
  const { genderProbabilityWad, lifespanProbabilityWad, crimeProbabilityWad } =
    worstCaseCategoryProbabilities(configuration);
  return (
    categoryVarianceTermWad(configuration, genderProbabilityWad) +
    categoryVarianceTermWad(configuration, lifespanProbabilityWad) +
    categoryVarianceTermWad(configuration, crimeProbabilityWad)
  );
}

/**
 * Mirrors `_worstCaseConfiguration`: the era configuration among `configurations` that maximizes the
 * worst-case payout, used to size pre-bet caps/risk before a session's era has been randomly picked.
 */
export function worstCaseConfiguration(configurations: SoulConfiguration[]): SoulConfiguration {
  let bestPayoutAtRefWager = -1n;
  let worst = configurations[0];
  if (!worst) throw new RangeError('worstCaseConfiguration requires at least one configuration');
  for (const configuration of configurations) {
    const payoutAtRefWager = maxPayout(configuration, WAD);
    if (payoutAtRefWager >= bestPayoutAtRefWager) {
      bestPayoutAtRefWager = payoutAtRefWager;
      worst = configuration;
    }
  }
  return worst;
}

/** Mirrors `_titleAverageRtpWad`: the average RTP across every era a title could randomly pick. */
export function titleAverageRtpWad(configurations: SoulConfiguration[]): bigint {
  const sum = configurations.reduce((total, configuration) => total + configuration.rtpWad, 0n);
  return sum / BigInt(configurations.length);
}

/** Mirrors the first `onRandomness` call: which era index a session's randomness picks. */
export function pickConfigurationIndex(randomness: Hex, configurationCount: number): number {
  return Number(hexToBigInt(randomness) % BigInt(configurationCount));
}
