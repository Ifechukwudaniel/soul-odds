import { describe, expect, it } from 'vitest';
import { mulberry32, pickWeighted } from '@/lib/mortal-odds/rng';

describe('mulberry32', () => {
  it('produces the same sequence for the same seed', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const sequenceA = [a(), a(), a()];
    const sequenceB = [b(), b(), b()];
    expect(sequenceA).toEqual(sequenceB);
  });

  it('produces different sequences for different seeds', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toBe(b());
  });

  it('stays within [0, 1)', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('pickWeighted', () => {
  it('always picks the only item with all the weight', () => {
    const rng = mulberry32(1);
    const result = pickWeighted({
      items: ['a', 'b'],
      weight: (item) => (item === 'a' ? 1 : 0),
      rng,
    });
    expect(result).toBe('a');
  });

  it('throws on an empty item list', () => {
    const rng = mulberry32(1);
    expect(() => pickWeighted({ items: [], weight: () => 1, rng })).toThrow();
  });

  it('is deterministic for a fixed seed', () => {
    const items = ['a', 'b', 'c'];
    const weight = (item: string) => (item === 'a' ? 1 : item === 'b' ? 2 : 3);
    const first = pickWeighted({ items, weight, rng: mulberry32(99) });
    const second = pickWeighted({ items, weight, rng: mulberry32(99) });
    expect(first).toBe(second);
  });
});
