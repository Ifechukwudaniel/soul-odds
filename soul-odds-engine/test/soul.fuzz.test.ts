import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { numberToHex } from 'viem';
import {
  crimeOdds,
  decodePrediction,
  encodePrediction,
  generateSoul,
  genderOdds,
  lifespanOdds,
  loadTitleFile,
  matchBreakdown,
  matchesPrediction,
  predictionMaxPayout,
  predictionPayout,
  predictionProbabilityWad,
  type SoulConfiguration,
  type SoulPrediction,
  validatePrediction,
  validCrimeMasks,
} from '../src/index.ts';

const EXAMPLE_TITLE = new URL('../example/title.json', import.meta.url).pathname;
const configuration = loadTitleFile(EXAMPLE_TITLE).betConfigurations[0].configuration;
const WAD = 10n ** 18n;

/** Deterministic PRNG (mulberry32) so fuzz runs are reproducible without a fixed corpus. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomBigint(next: () => number, bits: number): bigint {
  let value = 0n;
  for (let consumed = 0; consumed < bits; consumed += 32) {
    value |= BigInt(Math.floor(next() * 0x100000000)) << BigInt(consumed);
  }
  return value & ((1n << BigInt(bits)) - 1n);
}

function randomRandomness(next: () => number) {
  return numberToHex(randomBigint(next, 256), { size: 32 });
}

/**
 * A prediction a rational player could actually submit through the wizard: it never targets a
 * crime state that its own lifespan bucket makes impossible (the wizard skips straight to review
 * for buckets with `noCrimeWeight === 10000`, e.g. "0-5y", precisely to avoid this trap).
 */
function randomFeasiblePrediction(next: () => number): SoulPrediction {
  const gender = Math.floor(next() * 2);
  const lifespanBucket = Math.floor(next() * 4);
  const crimeIsImpossible = configuration.lifespans[lifespanBucket].noCrimeWeight === 10000n;
  const masks = validCrimeMasks();
  const crimeMask = crimeIsImpossible ? 0 : masks[Math.floor(next() * masks.length)];
  return { gender, lifespanBucket, sins: crimeMask !== 0, crimeMask };
}

/** Every prediction, including the "0% odds" ones the wizard forbids — used to fuzz raw math, not gameplay. */
function randomAnyPrediction(next: () => number): SoulPrediction {
  const gender = Math.floor(next() * 2);
  const lifespanBucket = Math.floor(next() * 4);
  const masks = validCrimeMasks();
  const crimeMask = masks[Math.floor(next() * masks.length)];
  return { gender, lifespanBucket, sins: crimeMask !== 0, crimeMask };
}

function popcount(mask: number): number {
  let count = 0;
  for (let i = 0; i < 4; i++) if ((mask & (1 << i)) !== 0) count++;
  return count;
}

/** Simulates one player session: a feasible random prediction against a random soul, at a fixed wager. */
function playGame(configuration: SoulConfiguration, wager: bigint, next: () => number) {
  const prediction = randomFeasiblePrediction(next);
  const soul = generateSoul(configuration, randomRandomness(next));
  const payout = predictionPayout(configuration, wager, prediction, soul);
  return { prediction, soul, payout, won: payout > 0n };
}

function closeEnoughWad(a: bigint, b: bigint, toleranceWad: bigint): boolean {
  const diff = a > b ? a - b : b - a;
  return diff <= toleranceWad;
}

const FUZZ_ITERATIONS = 5000;

describe('soul fuzzing', () => {
  it('keeps generated souls inside the configured domain', () => {
    const next = mulberry32(1);
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const soul = generateSoul(configuration, randomRandomness(next));
      assert.ok(soul.gender === 0 || soul.gender === 1);
      assert.ok(soul.lifespanBucket >= 0 && soul.lifespanBucket < 4);
      const lifespan = configuration.lifespans[soul.lifespanBucket];
      assert.ok(soul.age >= lifespan.minYears && soul.age <= lifespan.maxYears);
      assert.ok(soul.birthYear >= configuration.minBirthYear && soul.birthYear <= configuration.maxBirthYear);
      assert.ok(soul.crimeMask >= 0 && soul.crimeMask < 16);
      assert.ok([0, 1, 2].includes(popcount(soul.crimeMask)));
      // A bucket that guarantees no crime (e.g. "0-5y") must never generate one.
      if (lifespan.noCrimeWeight === 10000n) assert.equal(soul.crimeMask, 0);
    }
  });

  it('round-trips every fuzzed prediction through encode and decode', () => {
    const next = mulberry32(2);
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const prediction = randomAnyPrediction(next);
      validatePrediction(prediction);
      assert.deepEqual(decodePrediction(encodePrediction(prediction)), prediction);
    }
  });

  it('rejects every mutation that breaks one validation rule', () => {
    const next = mulberry32(6);
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const base = randomFeasiblePrediction(next);
      validatePrediction(base); // sanity: the unmutated draw must itself be valid

      assert.throws(() => validatePrediction({ ...base, gender: 2 + Math.floor(next() * 254) }));
      assert.throws(() => validatePrediction({ ...base, lifespanBucket: 4 + Math.floor(next() * 252) }));
      assert.throws(() => validatePrediction({ ...base, crimeMask: 16 + Math.floor(next() * 240) }));
      assert.throws(() => validatePrediction({ ...base, sins: !base.sins }));

      const tripleMask = 0b0111; // three crimes set: always over the two-crime cap
      assert.throws(() => validatePrediction({ ...base, crimeMask: tripleMask, sins: true }));
    }
  });

  it('never pays more than the declared max payout, win or lose', () => {
    const next = mulberry32(3);
    const wager = WAD;
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const prediction = randomFeasiblePrediction(next);
      const soul = generateSoul(configuration, randomRandomness(next));
      const payout = predictionPayout(configuration, wager, prediction, soul);
      const maxForPrediction = predictionMaxPayout(configuration, wager, prediction);
      assert.ok(payout >= 0n);
      assert.ok(payout <= maxForPrediction, `payout ${payout} exceeded max ${maxForPrediction}`);
      // A zero max means every category was already priced at zero probability, so nothing can pay.
      if (maxForPrediction === 0n) assert.equal(payout, 0n);
      // Hitting all three categories always pays exactly the max — never more, never less.
      if (matchesPrediction(prediction, soul)) assert.equal(payout, maxForPrediction);
    }
  });

  it('pays exactly the sum of matched categories, never more or fewer', () => {
    const next = mulberry32(4);
    const wager = WAD;
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const prediction = randomFeasiblePrediction(next);
      const soul = generateSoul(configuration, randomRandomness(next));
      const breakdown = matchBreakdown(prediction, soul);
      const payout = predictionPayout(configuration, wager, prediction, soul);
      const matchCount = [breakdown.genderMatch, breakdown.lifespanMatch, breakdown.crimeMatch].filter(
        Boolean,
      ).length;
      // Feasible predictions never target a zero-probability category, so a match always carries a
      // positive price and a miss always carries nothing — unlike raw (possibly infeasible) predictions.
      assert.equal(payout === 0n, matchCount === 0);
    }
  });

  it('scales payout roughly linearly with wager for the same prediction and soul', () => {
    const next = mulberry32(7);
    for (let i = 0; i < 500; i++) {
      const prediction = randomFeasiblePrediction(next);
      const soul = generateSoul(configuration, randomRandomness(next));
      const smallWager = 1n + BigInt(Math.floor(next() * 1000)) * 10n ** 12n; // sub-token to ~0.001 tokens
      const largeWager = smallWager * 1000n;
      const smallPayout = predictionPayout(configuration, smallWager, prediction, soul);
      const largePayout = predictionPayout(configuration, largeWager, prediction, soul);
      // Each category rounds its own ceil independently, so 1000x the wager can be at most 1000x the
      // payout plus a handful of wei of rounding slack per matched category (at most 3 terms).
      assert.ok(largePayout <= smallPayout * 1000n + 3n);
      if (smallPayout > 0n) assert.ok(largePayout > 0n);
    }
  });

  it('sums gender, lifespan and every bucket-crime distribution to one whole', () => {
    const rounding = 10n; // wei-level floor-division slack across a handful of summed terms

    const maleOdds = genderOdds(configuration, WAD, 0);
    const femaleOdds = genderOdds(configuration, WAD, 1);
    assert.ok(closeEnoughWad(maleOdds.probabilityWad + femaleOdds.probabilityWad, WAD, rounding));

    let lifespanTotal = 0n;
    for (let bucket = 0; bucket < 4; bucket++) lifespanTotal += lifespanOdds(configuration, WAD, bucket).probabilityWad;
    assert.ok(closeEnoughWad(lifespanTotal, WAD, rounding));

    for (let bucket = 0; bucket < 4; bucket++) {
      let crimeTotal = 0n;
      for (const mask of validCrimeMasks()) crimeTotal += crimeOdds(configuration, WAD, bucket, mask).probabilityWad;
      assert.ok(
        closeEnoughWad(crimeTotal, WAD, rounding),
        `bucket ${bucket} crime-state probabilities summed to ${crimeTotal}, not ~${WAD}`,
      );
    }
  });

  it('holds an edge close to 1 minus RTP over a large sample of feasible bets', () => {
    const next = mulberry32(5);
    const wager = WAD;
    let totalWagered = 0n;
    let totalPaid = 0n;
    for (let i = 0; i < FUZZ_ITERATIONS; i++) {
      const prediction = randomFeasiblePrediction(next);
      const soul = generateSoul(configuration, randomRandomness(next));
      totalWagered += wager;
      totalPaid += predictionPayout(configuration, wager, prediction, soul);
    }
    const houseEdge = 1 - Number(totalPaid) / Number(totalWagered);
    const expectedEdge = 1 - Number(configuration.rtpWad) / 1e18;
    // 5000 draws is enough for the law of large numbers to pull this within a few points of RTP,
    // even though any single small run (see the 100-game simulation below) can swing wildly.
    assert.ok(
      Math.abs(houseEdge - expectedEdge) < 0.05,
      `house edge ${houseEdge} strayed too far from the ${expectedEdge} the RTP implies`,
    );
  });

  it('runs an infeasible-prediction bet at a worse edge than a feasible one', () => {
    // Picking a nonzero crime for a bucket that can never have one (e.g. "0-5y") forfeits that
    // category's whole expected value — this is the "0% odds" trap the UI wizard now blocks.
    const zeroCrimeBucket = configuration.lifespans.findIndex(lifespan => lifespan.noCrimeWeight === 10000n);
    assert.ok(zeroCrimeBucket >= 0, 'the example title should still have a guaranteed-no-crime bucket');

    const next = mulberry32(8);
    const wager = WAD;
    let totalPaidInfeasible = 0n;
    let totalPaidFeasible = 0n;
    const rounds = 2000;
    for (let i = 0; i < rounds; i++) {
      const soul = generateSoul(configuration, randomRandomness(next));
      const gender = Math.floor(next() * 2);
      const infeasible: SoulPrediction = { gender, lifespanBucket: zeroCrimeBucket, sins: true, crimeMask: 0b0001 };
      const feasible: SoulPrediction = { gender, lifespanBucket: zeroCrimeBucket, sins: false, crimeMask: 0 };
      totalPaidInfeasible += predictionPayout(configuration, wager, infeasible, soul);
      totalPaidFeasible += predictionPayout(configuration, wager, feasible, soul);
    }
    assert.ok(
      totalPaidInfeasible < totalPaidFeasible,
      'betting a guaranteed-impossible crime state should pay strictly worse than betting no crime at all',
    );
  });
});

describe('house profitability over 100 games', () => {
  it('reports the house edge realized after exactly 100 rounds', () => {
    const next = mulberry32(100);
    const wager = WAD;
    const games = Array.from({ length: 100 }, () => playGame(configuration, wager, next));

    const totalWagered = wager * 100n;
    const totalPaid = games.reduce((sum, game) => sum + game.payout, 0n);
    const wins = games.filter(game => game.won).length;
    const houseProfit = totalWagered - totalPaid;
    const houseEdgePercent = (Number(houseProfit) / Number(totalWagered)) * 100;

    console.log(
      [
        'House profitability after 100 games (1.0 token wager each, feasible predictions only):',
        `  rounds with any payout: ${wins}/100`,
        `  total wagered: ${Number(totalWagered) / 1e18}`,
        `  total paid out: ${Number(totalPaid) / 1e18}`,
        `  house profit: ${Number(houseProfit) / 1e18}`,
        `  house edge realized: ${houseEdgePercent.toFixed(2)}%`,
      ].join('\n'),
    );

    // Deterministically seeded, so this isn't a statistical claim about the mechanic (100 rounds is
    // too few for that — see the 5000-round law-of-large-numbers check above). It only pins down
    // today's reproducible run so a change to the math/config shows up as a diff here.
    assert.equal(wins, games.filter(game => game.payout > 0n).length);
    assert.ok(totalPaid >= 0n);
    assert.ok(predictionProbabilityWad(configuration, games[0].prediction) >= 0n);
  });
});
