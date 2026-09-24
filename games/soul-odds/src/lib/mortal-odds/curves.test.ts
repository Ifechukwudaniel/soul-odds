import { describe, expect, it } from 'vitest';
import { interpolate } from '@/lib/mortal-odds/curves';

const points: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [10, 100],
  [20, 100],
];

describe('interpolate', () => {
  it('returns the exact value at a boundary point', () => {
    expect(interpolate({ points, x: 0 })).toBe(0);
    expect(interpolate({ points, x: 10 })).toBe(100);
    expect(interpolate({ points, x: 20 })).toBe(100);
  });

  it('interpolates linearly between points', () => {
    expect(interpolate({ points, x: 5 })).toBe(50);
  });

  it('clamps below the first point', () => {
    expect(interpolate({ points, x: -100 })).toBe(0);
  });

  it('clamps above the last point', () => {
    expect(interpolate({ points, x: 1000 })).toBe(100);
  });

  it('throws on an empty point list', () => {
    expect(() => interpolate({ points: [], x: 0 })).toThrow();
  });
});
