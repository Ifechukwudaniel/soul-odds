// Exact RTP audit for a Soul Odds title.
//
// Usage:  pnpm run verify-rtp -- [path/to/title.json]
//         (defaults to the title the game ships: games/soul-odds/.../soul-odds-title.json)
//
// It does not sample. For every era configuration it enumerates the sampler's whole probability
// space, computes what each of the 88 valid predictions is really worth per unit wagered against
// the payouts the engine pays, and compares that with the declared `rtpWad`.
//
// ⬢ What it proves
//   1. Declared RTP is inside the deployer's [93%, 98%] band for every era.
//   2. For every prediction, sum(P_true(category) * payout(category)) equals the declared RTP, where
//      P_true comes from the sampler's own algorithm and the payout from the mirror the contract
//      is tested against bit for bit. A gap here means the declared math and the paytable disagree.
//   3. The probabilities the payout is priced from match the sampler's true ones.

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { bytesToHex } from 'viem';
import {
  type SoulConfigurationDefinition,
  toConfiguration,
  toConfigurationInput,
} from '../src/configuration.ts';
import {
  type SoulConfiguration,
  crimeOdds,
  generateSoul,
  genderOdds,
  lifespanOdds,
  validCrimeMasks,
} from '../src/soul.ts';

const WAD = 10n ** 18n;
const BPS = 10_000;
const SECOND_CRIME_BPS = 2_500; // mirrors `secondChance < 2500` in sampleCrimes
const MIN_RTP_WAD = 93n * 10n ** 16n;
const MAX_RTP_WAD = 98n * 10n ** 16n;
const TOLERANCE = 1e-6; // relative; rounding in the payout maths is far below this

const defaultPath = new URL(
  '../../games/soul-odds/src/config/mortal-odds/soul-odds-title.json',
  import.meta.url,
);
const titlePath = process.argv[2] ?? defaultPath;
const titleLabel = process.argv[2] ?? defaultPath.pathname;
const title = JSON.parse(readFileSync(titlePath, 'utf8')) as {
  name: string;
  betConfigurations: SoulConfigurationDefinition[];
};

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The sampler's exact crime-mask distribution given that the soul has a crime, as integer counts
 * over `denominator`. It re-runs `sampleCrimes` over the whole period of its two random inputs
 * instead of trusting the closed-form probabilities the payout is priced from.
 *
 * The first draw is `random % S`; the second step reads BOTH its 25% chance and its index from one
 * value `x` (`x % 10000`, `x % S`), so it is enumerated over one period of (10000, S), lcm long.
 */
function exactCrimeMaskCounts(selectionWeights: number[]) {
  const total = selectionWeights.reduce((sum, weight) => sum + weight, 0);
  const period = (BPS / gcd(BPS, total)) * total;
  const counts = new Map<number, number>();

  for (let first = 0; first < selectionWeights.length; first++) {
    const weight = selectionWeights[first]!;
    if (weight === 0) continue;
    const firstMask = 1 << first;
    for (let x = 0; x < period; x++) {
      let mask = firstMask;
      if (x % BPS < SECOND_CRIME_BPS) {
        const second = x % total;
        let cumulative = 0;
        for (let j = 0; j < selectionWeights.length; j++) {
          cumulative += selectionWeights[j]!;
          if (second < cumulative && (mask & (1 << j)) === 0) {
            mask |= 1 << j;
            break;
          }
        }
      }
      counts.set(mask, (counts.get(mask) ?? 0) + weight);
    }
  }
  return { counts, denominator: total * period };
}

const percent = (value: number, digits = 4) => `${(value * 100).toFixed(digits)}%`;
const wadToNumber = (wad: bigint) => Number(wad) / 1e18;

type Row = { rtp: number; feasible: boolean };
let failures = 0;
const fail = (message: string) => {
  failures++;
  console.log(`  FAIL ${message}`);
};

console.log(`Title "${title.name}", ${title.betConfigurations.length} era configurations`);
console.log(`Source ${titleLabel}\n`);

const eraMeans: number[] = [];

for (const definition of title.betConfigurations) {
  const input = toConfigurationInput(definition);
  const configuration: SoulConfiguration = toConfiguration(input);
  const declared = wadToNumber(configuration.rtpWad);
  console.log(`${definition.name} (${definition.era})  declared RTP ${percent(declared, 2)}`);

  if (configuration.rtpWad < MIN_RTP_WAD || configuration.rtpWad > MAX_RTP_WAD) {
    fail(`declared RTP ${percent(declared, 2)} is outside the [93%, 98%] band`);
  }

  const selectionWeights = definition.crimes.map((crime) => crime.selectionWeight);
  const { counts, denominator } = exactCrimeMaskCounts(selectionWeights);
  const hasCrimeTotal = [...counts.values()].reduce((sum, count) => sum + count, 0);
  if (hasCrimeTotal !== denominator) fail('crime-mask counts do not sum to the whole');

  const genderTotal = Number(configuration.maleWeight + configuration.femaleWeight);
  const rows: Row[] = [];
  let worstProbabilityGap = 0;

  for (let gender = 0; gender < 2; gender++) {
    for (let bucket = 0; bucket < 4; bucket++) {
      const lifespan = definition.lifespans[bucket]!;
      for (const mask of validCrimeMasks()) {
        const g = genderOdds(configuration, WAD, gender);
        const l = lifespanOdds(configuration, WAD, bucket);
        const c = crimeOdds(configuration, WAD, bucket, mask);

        // True probabilities as exact fractions [numerator, denominator].
        const trueGender: [bigint, bigint] = [
          gender === 0 ? configuration.maleWeight : configuration.femaleWeight,
          BigInt(genderTotal),
        ];
        const trueLifespan: [bigint, bigint] = [
          BigInt(lifespan.weight),
          configuration.lifespanTotalWeight,
        ];
        const trueCrime: [bigint, bigint] =
          mask === 0
            ? [BigInt(lifespan.noCrimeWeight), BigInt(BPS)]
            : [
                BigInt(BPS - lifespan.noCrimeWeight) * BigInt(counts.get(mask) ?? 0),
                BigInt(BPS) * BigInt(denominator),
              ];

        // Expected return per WAD wagered = sum of P_true * payout, scaled by 1e9 for the division.
        const ev = [
          [trueGender, g.payout],
          [trueLifespan, l.payout],
          [trueCrime, c.payout],
        ] as const;
        let scaled = 0n;
        for (const [[numerator, denominatorPart], payout] of ev) {
          scaled += (numerator * payout * 10n ** 9n) / denominatorPart;
        }
        const rtp = Number(scaled) / 1e9 / 1e18;

        const feasible = g.payout > 0n && l.payout > 0n && c.payout > 0n;
        rows.push({ rtp, feasible });

        // Priced probability vs the sampler's true one, for the crime category (the only derived one).
        if (trueCrime[0] > 0n) {
          const truth = Number((trueCrime[0] * WAD) / trueCrime[1]) / 1e18;
          const priced = wadToNumber(c.probabilityWad);
          worstProbabilityGap = Math.max(worstProbabilityGap, Math.abs(priced - truth) / truth);
        }
      }
    }
  }

  const feasibleRows = rows.filter((row) => row.feasible);
  const infeasible = rows.length - feasibleRows.length;
  const rtps = feasibleRows.map((row) => row.rtp);
  const min = Math.min(...rtps);
  const max = Math.max(...rtps);
  const mean = rtps.reduce((sum, value) => sum + value, 0) / rtps.length;
  eraMeans.push(mean);

  console.log(
    `  ${rows.length} valid predictions: ${feasibleRows.length} feasible, ${infeasible} include a crime the bucket can never produce`,
  );
  console.log(
    `  true RTP over feasible predictions   min ${percent(min, 6)}  mean ${percent(mean, 6)}  max ${percent(max, 6)}`,
  );
  console.log(`  worst crime probability the payout is priced from vs the sampler's: ${worstProbabilityGap.toExponential(2)} relative`);

  if (Math.abs(min - declared) / declared > TOLERANCE || Math.abs(max - declared) / declared > TOLERANCE) {
    fail(`a feasible prediction returns ${percent(min, 6)}..${percent(max, 6)}, not the declared ${percent(declared, 2)}`);
  }
  if (worstProbabilityGap > TOLERANCE) {
    fail('the crime probabilities the payout uses differ from the sampler\'s true distribution');
  }

  // Independent check of my own enumeration against the real sampler, on random inputs.
  const samples = 200_000;
  const observed = new Map<number, number>();
  for (let i = 0; i < samples; i++) {
    const soul = generateSoul(configuration, bytesToHex(randomBytes(32)));
    observed.set(soul.crimeMask, (observed.get(soul.crimeMask) ?? 0) + 1);
  }
  const lifespanTotal = Number(configuration.lifespanTotalWeight);
  let worstSigma = 0;
  for (const mask of validCrimeMasks()) {
    let probability = 0;
    definition.lifespans.forEach((lifespan) => {
      const bucketShare = lifespan.weight / lifespanTotal;
      const noCrime = lifespan.noCrimeWeight / BPS;
      probability +=
        mask === 0
          ? bucketShare * noCrime
          : bucketShare * (1 - noCrime) * ((counts.get(mask) ?? 0) / denominator);
    });
    const expectedCount = probability * samples;
    const sigma = Math.sqrt(samples * probability * (1 - probability)) || 1;
    worstSigma = Math.max(worstSigma, Math.abs((observed.get(mask) ?? 0) - expectedCount) / sigma);
  }
  console.log(`  enumeration vs ${samples.toLocaleString()} real sampler draws: worst deviation ${worstSigma.toFixed(2)} sigma`);
  if (worstSigma > 5) fail('my exact enumeration disagrees with generateSoul (audit bug or sampler drift)');
  console.log();
}

const titleMean = eraMeans.reduce((sum, value) => sum + value, 0) / eraMeans.length;
console.log(`Title RTP (uniform over eras, uniform over feasible predictions): ${percent(titleMean, 6)}`);
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
