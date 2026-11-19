// Settling a round from its VRF words, in the browser and the demo host. Imports viem, so the
// title itself (title.ts) stays out of it.
import { concatHex, encodePacked, keccak256, stringToHex, type Hex } from 'viem';
import {
  CRIME_MASKS,
  CRIME_MATCH,
  ERAS,
  GENDER_MATCH,
  jointMass,
  LIFESPAN_MATCH,
  predictionTable,
  type Prediction,
  type TableTier,
} from './soul-math';

// =====================================
// ⬢ Display soul
// =====================================

export type DerivedSoul = {
  gender: number;
  lifespanBucket: number;
  crimeMask: number;
  age: number;
};

function draw(word: Hex, salt: string): bigint {
  return BigInt(keccak256(concatHex([word, stringToHex(salt)])));
}

/**
 * The soul a settled round shows. The chain settles which categories hit; this picks a soul that
 * hit exactly those, from the era's true distribution given the hits, seeded by the round's own
 * VRF word so the same round always shows the same soul.
 */
export function deriveSoul(
  eraIndex: number,
  prediction: Prediction,
  flags: number,
  word: Hex,
): DerivedSoul {
  const era = ERAS[eraIndex];
  if (!era) throw new RangeError(`Unknown era ${eraIndex}`);

  const candidates: { gender: number; bucket: number; mask: number; weight: bigint }[] = [];
  let total = 0n;
  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < 4; bucket++) {
      for (const mask of CRIME_MASKS) {
        const matches =
          (gender === prediction.gender ? GENDER_MATCH : 0) |
          (bucket === prediction.lifespanBucket ? LIFESPAN_MATCH : 0) |
          (mask === prediction.crimeMask ? CRIME_MATCH : 0);
        if (matches !== flags) continue;
        const weight = era.genderWeights[gender]! * jointMass(era, bucket, mask);
        if (weight === 0n) continue;
        candidates.push({ gender, bucket, mask, weight });
        total += weight;
      }
    }
  }
  if (total === 0n) throw new Error('No soul matches that outcome');

  let roll = draw(word, 'soul') % total;
  const picked = candidates.find((candidate) => {
    if (roll < candidate.weight) return true;
    roll -= candidate.weight;
    return false;
  })!;

  const { minYears, maxYears } = era.lifespanYears[picked.bucket]!;
  const age = minYears + Number(draw(word, 'age') % BigInt(maxYears - minYears + 1));
  return { gender: picked.gender, lifespanBucket: picked.bucket, crimeMask: picked.mask, age };
}

// =====================================
// ⬢ Settlement, as the graph engine does it
// =====================================

/** The graph engine's n-th draw from a VRF word. Checked against the SDK's own in title.test.ts. */
export function graphDraw(word: Hex, index: number): bigint {
  return BigInt(
    keccak256(encodePacked(['bytes32', 'string', 'uint256'], [word, 'graph', BigInt(index)])),
  );
}

export function sampleOutcome(weights: readonly bigint[], roll: bigint): number {
  let target = roll % weights.reduce((sum, weight) => sum + weight, 0n);
  for (const [index, weight] of weights.entries()) {
    if (target < weight) return index;
    target -= weight;
  }
  throw new Error('unreachable: the roll falls inside the total weight');
}

/** The era a session's first VRF word picks: the title's opening chance node, one equal outcome per era. */
export function eraFromWord(word: Hex): number {
  return sampleOutcome(
    ERAS.map(() => 1n),
    graphDraw(word, 0),
  );
}

/** The tier a session's settling VRF word lands on, for the era it drew and the prediction it took. */
export function settleTier(eraIndex: number, index: number, word: Hex): TableTier {
  const table = predictionTable(eraIndex, index);
  return table[
    sampleOutcome(
      table.map((tier) => tier.weight),
      graphDraw(word, 0),
    )
  ]!;
}
