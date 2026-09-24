import { describe, expect, it } from 'vitest';
import type { ShockConfig } from '@/lib/mortal-odds/config';
import { mulberry32 } from '@/lib/mortal-odds/rng';
import { applyShocks } from '@/lib/mortal-odds/shocks';

const WAR: ShockConfig = {
  id: 'test-war',
  label: 'Test War',
  phrase: 'a test war',
  from: 1940,
  to: 1945,
  rate: { eur: 1 },
};

describe('applyShocks', () => {
  it("never strikes a life that never overlaps the shock's window", () => {
    const hit = applyShocks({
      year: 2000,
      region: 'eur',
      sex: 'boy',
      age: 10,
      rng: mulberry32(1),
      shocks: [WAR],
    });
    expect(hit).toBeNull();
  });

  it("never strikes a region the shock doesn't list", () => {
    const hit = applyShocks({
      year: 1940,
      region: 'eas',
      sex: 'boy',
      age: 10,
      rng: mulberry32(1),
      shocks: [WAR],
    });
    expect(hit).toBeNull();
  });

  it('strikes within the exposure window when the rate is certain', () => {
    const hit = applyShocks({
      year: 1940,
      region: 'eur',
      sex: 'boy',
      age: 10,
      rng: mulberry32(1),
      shocks: [WAR],
    });
    expect(hit).not.toBeNull();
    expect(hit?.age).toBeGreaterThanOrEqual(0);
    expect(hit?.age).toBeLessThanOrEqual(4);
    expect(hit?.shock.id).toBe('test-war');
  });

  it('respects an age window filter', () => {
    const narrow: ShockConfig = { ...WAR, ages: [50, 60] };
    // ✦ Born in 1940, age 10 at the war's start -> the person is 10-15 during 1940-1945,
    //   well outside the [50, 60] age filter, so exposure should be zero.
    const hit = applyShocks({
      year: 1940,
      region: 'eur',
      sex: 'boy',
      age: 10,
      rng: mulberry32(1),
      shocks: [narrow],
    });
    expect(hit).toBeNull();
  });

  it('applies the sex multiplier', () => {
    const sexSkewed: ShockConfig = {
      ...WAR,
      rate: { eur: 0.5 },
      sexMultiplier: { boy: 2, girl: 0 },
    };
    const girlHit = applyShocks({
      year: 1940,
      region: 'eur',
      sex: 'girl',
      age: 10,
      rng: mulberry32(1),
      shocks: [sexSkewed],
    });
    expect(girlHit).toBeNull();
  });

  it('is deterministic for a fixed seed', () => {
    const a = applyShocks({
      year: 1940,
      region: 'eur',
      sex: 'boy',
      age: 10,
      rng: mulberry32(42),
      shocks: [WAR],
    });
    const b = applyShocks({
      year: 1940,
      region: 'eur',
      sex: 'boy',
      age: 10,
      rng: mulberry32(42),
      shocks: [WAR],
    });
    expect(a).toEqual(b);
  });
});
