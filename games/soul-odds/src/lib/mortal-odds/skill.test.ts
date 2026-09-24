import { describe, expect, it } from 'vitest';
import { accumulateSkill, computeBetSkill } from '@/lib/mortal-odds/skill';

describe('computeBetSkill', () => {
  it('is never negative, win or lose', () => {
    for (const stake of [0.5, 1, 25, 100]) {
      for (const odds of [1.05, 2, 12]) {
        for (const won of [true, false]) {
          expect(computeBetSkill({ stake, won, odds })).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('still earns points for a losing bet, just from staking', () => {
    expect(computeBetSkill({ stake: 10, won: false, odds: 2 })).toBeGreaterThan(0);
  });

  it('earns more for a win than a loss at the same stake and odds', () => {
    const lost = computeBetSkill({ stake: 10, won: false, odds: 3 });
    const won = computeBetSkill({ stake: 10, won: true, odds: 3 });
    expect(won).toBeGreaterThan(lost);
  });

  it('scales with stake', () => {
    const unit = computeBetSkill({ stake: 1, won: true, odds: 3 });
    expect(computeBetSkill({ stake: 25, won: true, odds: 3 })).toBeCloseTo(unit * 25);
  });

  it('a bigger win (higher odds) earns more than a smaller one, at the same stake', () => {
    const small = computeBetSkill({ stake: 10, won: true, odds: 1.5 });
    const big = computeBetSkill({ stake: 10, won: true, odds: 5 });
    expect(big).toBeGreaterThan(small);
  });
});

describe('accumulateSkill', () => {
  it("adds a round's points to the running total", () => {
    expect(accumulateSkill(100, 20)).toBe(120);
  });

  it('floors at 0 instead of ever going negative', () => {
    expect(accumulateSkill(10, -50)).toBe(0);
  });

  it('climbs back to 0 from an old negative balance on the very next round', () => {
    expect(accumulateSkill(-483, 5)).toBe(0);
  });
});
