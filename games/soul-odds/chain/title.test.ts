import { randomBytes } from 'node:crypto';
import {
  compileGraphGame,
  graphDraw as sdkGraphDraw,
  sampleOutcome as sdkSampleOutcome,
  walkChance,
} from '@chain-protocol/casino-sdk/graph-engine';
import { toConfiguration, toConfigurationInput } from '@chain/soul-odds-engine/configuration';
import { generateSoul } from '@chain/soul-odds-engine/soul';
import { bytesToHex } from 'viem';
import { describe, expect, it } from 'vitest';
import titleFile from '../src/config/mortal-odds/soul-odds-title.json';
import { exactCrimeMaskCounts } from './crime-mask-enumeration';
import crimeMaskFile from './era-crime-masks.json';
import {
  CRIME_MASKS,
  CRIME_MATCH,
  ERAS,
  GENDER_MATCH,
  LIFESPAN_MATCH,
  PREDICTION_COUNT,
  predictionFromIndex,
  predictionIndex,
  predictionTable,
  prizeDenominator,
  TABLE_WEIGHT,
} from './soul-math';
import { deriveSoul, eraFromWord, graphDraw, sampleOutcome, settleTier } from './soul-settle';
import title, { type State } from './title';

const word = () => bytesToHex(randomBytes(32));
const compiled = compileGraphGame(title);

describe('era-crime-masks.json', () => {
  it("matches the sampler's exact enumeration (run pnpm run generate:crime-masks if not)", () => {
    for (const era of titleFile.betConfigurations) {
      expect((crimeMaskFile as Record<string, unknown>)[era.name]).toEqual(
        exactCrimeMaskCounts(era.crimes.map((crime) => crime.selectionWeight)),
      );
    }
  });

  it("agrees with the engine sampler's crime states", () => {
    const samples = 60_000;
    for (const [eraIndex, era] of ERAS.entries()) {
      const configuration = toConfiguration(
        toConfigurationInput(titleFile.betConfigurations[eraIndex] as never),
      );
      const observed = new Map<number, number>();
      for (let i = 0; i < samples; i++) {
        const { crimeMask } = generateSoul(configuration, word());
        observed.set(crimeMask, (observed.get(crimeMask) ?? 0) + 1);
      }
      for (const mask of CRIME_MASKS) {
        const expected = (() => {
          let mass = 0;
          for (let bucket = 0; bucket < 4; bucket++) {
            const weight = Number(era.lifespanWeights[bucket]) / Number(era.lifespanTotal);
            const noCrime = Number(era.noCrimeWeights[bucket]) / 10_000;
            mass +=
              weight *
              (mask === 0
                ? noCrime
                : (1 - noCrime) *
                  (Number(era.maskCounts.get(mask) ?? 0n) / Number(era.maskDenominator)));
          }
          return mass;
        })();
        expect(Math.abs((observed.get(mask) ?? 0) / samples - expected)).toBeLessThan(0.012);
      }
    }
  }, 60_000);
});

describe('prediction index', () => {
  it('round-trips all 88 predictions', () => {
    expect(PREDICTION_COUNT).toBe(88);
    for (let index = 0; index < PREDICTION_COUNT; index++) {
      expect(predictionIndex(predictionFromIndex(index))).toBe(index);
    }
  });
});

describe('prediction tables', () => {
  it('weigh exactly TABLE_WEIGHT and never return more than the declared RTP', () => {
    const unit = prizeDenominator();
    for (const [eraIndex, era] of ERAS.entries()) {
      for (let index = 0; index < PREDICTION_COUNT; index++) {
        const table = predictionTable(eraIndex, index);
        expect(table.reduce((sum, tier) => sum + tier.weight, 0n)).toBe(TABLE_WEIGHT);
        const returned = table.reduce((sum, tier) => sum + tier.prizeUnits * tier.weight, 0n);
        expect(returned * era.rtp.d).toBeLessThanOrEqual(era.rtp.n * unit * TABLE_WEIGHT);
        // ✦ Within 0.01% of the declared RTP, so the rounding never costs the player anything real.
        expect(
          Number(returned * 10_000n * era.rtp.d) / Number(era.rtp.n * unit * TABLE_WEIGHT),
        ).toBeGreaterThan(9_999);
      }
    }
  });
});

describe('compiled graph', () => {
  it("stays within the title's declared RTP and the 98% approval ceiling", () => {
    const figures = compiled.derived.configurations[0]!;
    expect(figures.rtpWad).toBeLessThanOrEqual(980_000_000_000_000_000n);
    expect(figures.rtpWad).toBeGreaterThan(979_900_000_000_000_000n);
    expect(compiled.derived.maxStake).toBe(1n);
  });

  it('settles like the engine: era from the first word, prediction tier from the second', () => {
    const decisionOf = new Map<number, number>();
    compiled.manifest.forEach((state: State, id: number) => {
      if (state.at === 'predict') decisionOf.set(state.era, id);
    });

    for (let trial = 0; trial < 300; trial++) {
      const eraWord = word();
      const rootWalk = walkChance(compiled.graph, compiled.graph.roots[0]!, eraWord, 0);
      const eraState = compiled.manifest[rootWalk.node] as State;
      expect(eraState.at).toBe('predict');
      if (eraState.at !== 'predict') return;
      const era = eraState.era;
      expect(rootWalk.labels).toEqual([era]);
      expect(eraFromWord(eraWord)).toBe(era);
      expect(decisionOf.get(era)).toBe(rootWalk.node);

      const prediction = Math.floor(Math.random() * PREDICTION_COUNT);
      const decision = compiled.graph.nodes[rootWalk.node]!;
      if (decision.kind !== 'decision') throw new Error('expected a decision');
      expect(decision.edges[prediction]!.label).toBe(prediction);

      const settleWord = word();
      const walk = walkChance(compiled.graph, decision.edges[prediction]!.child, settleWord, 0);
      const table = predictionTable(era, prediction);
      const tier =
        table[
          sdkSampleOutcome(
            table.map((t) => t.weight),
            sdkGraphDraw(settleWord, 0),
          )
        ]!;
      expect(walk.prize).toBe(tier.prizeUnits);
      expect(walk.labels).toEqual([tier.flags]);
      expect(settleTier(era, prediction, settleWord)).toEqual(tier);
      expect(graphDraw(settleWord, 0)).toBe(sdkGraphDraw(settleWord, 0));
      expect(sampleOutcome([3n, 5n], 9n)).toBe(sdkSampleOutcome([3n, 5n], 9n));
    }
  });
});

describe('deriveSoul', () => {
  it('shows a soul that hit exactly the categories the chain settled', () => {
    for (let trial = 0; trial < 400; trial++) {
      const era = Math.floor(Math.random() * ERAS.length);
      const index = Math.floor(Math.random() * PREDICTION_COUNT);
      const prediction = predictionFromIndex(index);
      const table = predictionTable(era, index);
      const tier = table[Math.floor(Math.random() * table.length)]!;
      const soul = deriveSoul(era, prediction, tier.flags, word());
      const flags =
        (soul.gender === prediction.gender ? GENDER_MATCH : 0) |
        (soul.lifespanBucket === prediction.lifespanBucket ? LIFESPAN_MATCH : 0) |
        (soul.crimeMask === prediction.crimeMask ? CRIME_MATCH : 0);
      expect(flags).toBe(tier.flags);
      const { minYears, maxYears } = ERAS[era]!.lifespanYears[soul.lifespanBucket]!;
      expect(soul.age).toBeGreaterThanOrEqual(minYears);
      expect(soul.age).toBeLessThanOrEqual(maxYears);
    }
  });

  it('is deterministic for a given round word', () => {
    const prediction = predictionFromIndex(10);
    const w = word();
    expect(deriveSoul(2, prediction, 0, w)).toEqual(deriveSoul(2, prediction, 0, w));
  });
});
