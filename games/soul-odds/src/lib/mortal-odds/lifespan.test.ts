import { describe, expect, it } from 'vitest';
import { buildLifespanHistogram, histogram, lifespanCap } from '@/lib/mortal-odds/lifespan';

describe('histogram', () => {
  it('bins ages into 21 five-year buckets summing to 1', () => {
    const samples = [{ age: 0 }, { age: 4 }, { age: 30 }, { age: 99 }, { age: 150 }];
    const bins = histogram(samples);
    expect(bins).toHaveLength(21);
    expect(bins.reduce((sum, b) => sum + b, 0)).toBeCloseTo(1);
  });

  it('caps ages at 100+ into the last bin', () => {
    const bins = histogram([{ age: 500 }]);
    expect(bins[20]).toBe(1);
  });
});

describe('lifespanCap', () => {
  it('excludes the infant-mortality bin from the cap, using 2x the tallest adult bin', () => {
    const chart = buildLifespanHistogram({
      truthSamples: [{ age: 0 }, { age: 0 }, { age: 0 }, { age: 40 }],
      bookieSamples: [{ age: 40 }],
    });
    // real bins: bin0 = 3/4 = 0.75, bin8 (age 40) = 1/4 = 0.25 -> tallest non-bin0 real is 0.25
    // bookie bins: bin8 = 1 -> tallest non-bin0 bookie is 1
    // cap = max(0.25, 1) * 2 = 2
    expect(lifespanCap(chart)).toBeCloseTo(2);
  });
});
