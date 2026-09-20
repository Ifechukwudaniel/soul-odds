import { encodeAbiParameters, type Hex, hexToBigInt, keccak256, numberToHex } from 'viem';

export const SOUL_ERAS = [
  'Ancient',
  'Medieval',
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
export type SoulResult = { gender: number; age: number; lifespanBucket: number; crimeMask: number };

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

function sampleLifespan(configuration: SoulConfiguration, random: bigint): number {
  const roll = random % configuration.lifespanTotalWeight;
  let cumulative = 0n;
  for (let i = 0; i < LIFESPAN_COUNT; i++) {
    cumulative += configuration.lifespans[i].weight;
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

function sampleCrimes(configuration: SoulConfiguration, random: bigint): number {
  let selectionTotal = 0n;
  for (let i = 0; i < CRIME_COUNT; i++) selectionTotal += configuration.crimes[i].selectionWeight;

  let mask = 0;
  const first = random % selectionTotal;
  let cumulative = 0n;
  for (let i = 0; i < CRIME_COUNT; i++) {
    cumulative += configuration.crimes[i].selectionWeight;
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
      cumulative += configuration.crimes[i].selectionWeight;
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
  const lifespan = configuration.lifespans[lifespanBucket];
  const age = sampleAge(lifespan, random >> 64n);
  const noCrime = sampleNoCrime(lifespan, random >> 96n);
  const crimeMask = noCrime ? 0 : sampleCrimes(configuration, random >> 128n);
  return { gender, age, lifespanBucket, crimeMask };
}

export function matchesPrediction(prediction: SoulPrediction, result: SoulResult): boolean {
  if (prediction.gender !== result.gender) return false;
  if (prediction.lifespanBucket !== result.lifespanBucket) return false;
  if (prediction.sins !== (result.crimeMask !== 0)) return false;
  return prediction.crimeMask === result.crimeMask;
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
  const probabilityWad = mulDivFloor(configuration.crimes[index].selectionWeight, WAD, selectionTotal);
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
  const probabilityA = mulDivFloor(configuration.crimes[first].selectionWeight, WAD, selectionTotal);
  const probabilityB = mulDivFloor(configuration.crimes[second].selectionWeight, WAD, selectionTotal);
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
  for (let i = 0; i < CRIME_COUNT; i++) selectionTotal += configuration.crimes[i].selectionWeight;
  const maskProbabilityWad = crimeMaskProbabilityWad(configuration, selectionTotal, crimeMask);
  return mulDivFloor(hasCrimeProbabilityWad, maskProbabilityWad, WAD);
}

/** Mirrors `_predictionProbabilityWad`: exact chance a random soul matches `prediction`. */
export function predictionProbabilityWad(
  configuration: SoulConfiguration,
  prediction: SoulPrediction,
): bigint {
  const genderWeight = prediction.gender === 0 ? configuration.maleWeight : configuration.femaleWeight;
  const genderTotal = configuration.maleWeight + configuration.femaleWeight;
  const genderProbabilityWad = mulDivFloor(genderWeight, WAD, genderTotal);

  const lifespan = configuration.lifespans[prediction.lifespanBucket];
  const lifespanProbabilityWad = mulDivFloor(lifespan.weight, WAD, configuration.lifespanTotalWeight);

  const crimeProbabilityWad = crimeStateProbabilityWad(configuration, lifespan, prediction.crimeMask);

  return mulDivFloor(
    mulDivFloor(genderProbabilityWad, lifespanProbabilityWad, WAD),
    crimeProbabilityWad,
    WAD,
  );
}

/** Smallest probability across every valid prediction — mirrors `_minimumPredictionProbability`. */
export function minimumPredictionProbabilityWad(configuration: SoulConfiguration): bigint {
  let minProbabilityWad = WAD;
  const masks = validCrimeMasks();
  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < LIFESPAN_COUNT; bucket++) {
      for (const mask of masks) {
        const probabilityWad = predictionProbabilityWad(configuration, {
          gender,
          lifespanBucket: bucket,
          sins: mask !== 0,
          crimeMask: mask,
        });
        if (probabilityWad > 0n && probabilityWad < minProbabilityWad) minProbabilityWad = probabilityWad;
      }
    }
  }
  return minProbabilityWad;
}

/** Mirrors `_predictionMaxPayout`/`_predictionPayout`: what `wager` pays if `prediction` hits. */
export function predictionPayout(
  configuration: SoulConfiguration,
  wager: bigint,
  prediction: SoulPrediction,
): bigint {
  const probability = predictionProbabilityWad(configuration, prediction);
  if (probability === 0n) return 0n;
  return mulDivCeil(wager, configuration.rtpWad, probability);
}

/** Mirrors `_maxPayout`: the largest payout any prediction on this configuration could ever owe. */
export function maxPayout(configuration: SoulConfiguration, wager: bigint): bigint {
  return mulDivCeil(wager, configuration.rtpWad, minimumPredictionProbabilityWad(configuration));
}

/** Mirrors `_varianceWad`: per-wager-squared variance of the riskiest (rarest) prediction. */
export function varianceWad(configuration: SoulConfiguration): bigint {
  const minProbabilityWad = minimumPredictionProbabilityWad(configuration);
  const rtpSquaredWad = mulDivCeil(configuration.rtpWad, configuration.rtpWad, WAD);
  const oneMinusProbabilityWad = WAD - minProbabilityWad;
  return mulDivCeil(oneMinusProbabilityWad, rtpSquaredWad, minProbabilityWad);
}
