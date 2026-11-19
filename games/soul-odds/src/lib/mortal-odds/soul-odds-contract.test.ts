import { randomBytes } from 'node:crypto';
import { bytesToHex } from 'viem';
import { describe, expect, it } from 'vitest';
import {
  buildPrediction,
  configurationIndexFromSession,
  decodeSettledSoul,
  encodeMortalOddsPrediction,
  previewCategoryPrices,
  previewSinsPrices,
} from '@/lib/mortal-odds/soul-odds-contract';
import type { Bet } from '@/types';
import { ERAS } from '../../../chain/soul-math';

const rtpOf = (era: number) => Number(ERAS[era]!.rtp.n) / Number(ERAS[era]!.rtp.d);

const WAGER = 10n ** 19n;
const bet = (marketId: string, optionId: string): Bet => ({
  marketId,
  kind: 'choice',
  optionId,
  stake: 1,
});

describe('previewSinsPrices', () => {
  it('prices every crime state the contract accepts: none, four singles and six pairs', () => {
    const options = Object.keys(previewSinsPrices(WAGER, 2, 0));
    expect(options).toHaveLength(11);
    expect(options).toContain('violence+heresy');
    expect(options).toContain('none');
  });

  it("pays the multiplier on a category's third of the wager, rtp / p", () => {
    const rtp = rtpOf(0);
    for (const price of Object.values(previewSinsPrices(WAGER, 2, 0))) {
      expect(price.odds).toBeCloseTo(rtp / price.p, 2);
    }
  });

  it("pins to one era's odds instead of averaging every era", () => {
    const perEra = ERAS.map((_era, index) => previewSinsPrices(WAGER, 2, index).heresy!.odds!);
    expect(Math.max(...perEra)).toBeGreaterThan(Math.min(...perEra) * 2);
  });

  it('before the era is known, pays the multiplier that goes with the average chance, not the average multiplier', () => {
    const rtp = rtpOf(0);
    const perEra = ERAS.map((_era, index) => previewSinsPrices(WAGER, 2, index).heresy!.odds!);
    const average = previewSinsPrices(WAGER, 2).heresy!;
    expect(average.odds).toBeCloseTo(rtp / average.p, 6);
    expect(average.odds).toBeLessThan(perEra.reduce((sum, odds) => sum + odds, 0) / perEra.length);
  });

  it('prices a pair below the odds of naming only one of its sins wrong', () => {
    const prices = previewSinsPrices(WAGER, 2, 0);
    expect(prices['violence+greed']!.p).toBeLessThan(prices.violence!.p);
  });
});

describe('previewCategoryPrices', () => {
  it('prices a 5 to 29 death near 8x before the era is known, and no era pays a silly amount for it', () => {
    const { age } = previewCategoryPrices(WAGER);
    expect(age.y!.odds).toBeCloseTo(8, 0);
    const perEra = ERAS.map((_era, index) => previewCategoryPrices(WAGER, 0, index).age.y!.odds!);
    expect(Math.max(...perEra)).toBeLessThan(40);
  });

  it('makes the youngest and oldest ages likelier to be missed in the era they are rare', () => {
    const first = previewCategoryPrices(WAGER, 0, 0).age;
    const last = previewCategoryPrices(WAGER, 0, ERAS.length - 1).age;
    expect(last.o!.p).toBeGreaterThan(first.o!.p);
    expect(last.u5!.p).toBeLessThan(first.u5!.p);
  });

  it('pins sex and age to the same era as the sins', () => {
    const pinned = previewCategoryPrices(WAGER, 2, 3);
    expect(pinned.sins).toEqual(previewSinsPrices(WAGER, 2, 3));
  });
});

describe('buildPrediction', () => {
  it('encodes a pair of sins as two crime bits', () => {
    const prediction = buildPrediction({
      sex: bet('sex', 'girl'),
      age: bet('age', 'm'),
      sins: bet('sins', 'violence+greed'),
    });
    expect(prediction).toEqual({ gender: 1, lifespanBucket: 2, sins: true, crimeMask: 0b0101 });
  });

  it('encodes a clean heart as no crime', () => {
    const prediction = buildPrediction({
      sex: bet('sex', 'boy'),
      age: bet('age', 'u5'),
      sins: bet('sins', 'none'),
    });
    expect(prediction).toEqual({ gender: 0, lifespanBucket: 0, sins: false, crimeMask: 0 });
  });
});

describe('encodeMortalOddsPrediction', () => {
  it("encodes the prediction's index among the title's 88 as a uint256", () => {
    const first = encodeMortalOddsPrediction({
      sex: bet('sex', 'boy'),
      age: bet('age', 'u5'),
      sins: bet('sins', 'none'),
    });
    expect(BigInt(first)).toBe(0n);
    const last = encodeMortalOddsPrediction({
      sex: bet('sex', 'girl'),
      age: bet('age', 'o'),
      sins: bet('sins', 'greed+heresy'),
    });
    expect(BigInt(last)).toBe(87n);
  });
});

const word = () => bytesToHex(randomBytes(32));

describe('configurationIndexFromSession', () => {
  it('reads the era from the first VRF word', () => {
    const first = word();
    const era = configurationIndexFromSession({
      randomnessRequests: [{ nonce: '0', randomness: first, fulfilled: true }],
    });
    expect(era).toBeGreaterThanOrEqual(0);
    expect(era).toBeLessThan(ERAS.length);
    expect(configurationIndexFromSession({ randomness: first })).toBe(era);
  });

  it('is null until a word has arrived', () => {
    expect(configurationIndexFromSession({})).toBeNull();
    expect(
      configurationIndexFromSession({ randomnessRequests: [{ nonce: '0', fulfilled: false }] }),
    ).toBeNull();
  });
});

describe('decodeSettledSoul', () => {
  const prediction = { gender: 1, lifespanBucket: 2, sins: false, crimeMask: 0 };

  it('needs the settling word, not just the one that drew the era', () => {
    expect(() => decodeSettledSoul({ randomness: word() }, prediction, 0)).toThrow();
  });

  it('shows a soul that matches exactly the categories the chain settled', () => {
    for (let trial = 0; trial < 50; trial++) {
      const raw = {
        randomnessRequests: [
          { nonce: '0', randomness: word(), fulfilled: true },
          { nonce: '1', randomness: word(), fulfilled: true },
        ],
      };
      const { result, breakdown, won } = decodeSettledSoul(raw, prediction, 3);
      expect(result.gender === prediction.gender).toBe(breakdown.genderMatch);
      expect(result.lifespanBucket === prediction.lifespanBucket).toBe(breakdown.lifespanMatch);
      expect(result.crimeMask === prediction.crimeMask).toBe(breakdown.crimeMatch);
      expect(won).toBe(breakdown.genderMatch || breakdown.lifespanMatch || breakdown.crimeMatch);
    }
  });
});

describe('crime pricing', () => {
  it('does not depend on the age bucket picked, and returns exactly the RTP per category', () => {
    expect(previewSinsPrices(WAGER, 0, 2)).toEqual(previewSinsPrices(WAGER, 3, 2));
    const rtp = rtpOf(2);
    for (const price of Object.values(previewSinsPrices(WAGER, 0, 2))) {
      expect(price.p * price.odds!).toBeCloseTo(rtp, 6);
    }
  });
});
