import type { ShockConfig } from '@/lib/mortal-odds/config';
import type { Rng } from '@/lib/mortal-odds/rng';
import type { RegionId, Sex, Shock } from '@/types';

/**
 * The first catastrophe that overlaps this life's exposure window sets the age at death.
 * Only called for the full model - the bookie never sees this.
 */
export function applyShocks(options: {
  year: number;
  region: RegionId;
  sex: Sex;
  age: number;
  rng: Rng;
  shocks: ShockConfig[];
}): { age: number; shock: Shock } | null {
  const { year, region, sex, age, rng, shocks } = options;

  for (const s of shocks) {
    const base = s.rate[region] ?? s.rate.all;
    if (!base) continue;

    const [amin, amax] = s.ages ?? [0, 120];
    const lo = Math.max(s.from - year, 0, amin);
    const hi = Math.min(s.to - year, age - 1, amax);
    if (lo > hi) continue;

    const exposure = (hi - lo + 1) / (s.to - s.from + 1);
    const p = base * (s.sexMultiplier?.[sex] ?? 1) * exposure;

    if (rng() < p) {
      return {
        age: lo + Math.floor(rng() * (hi - lo + 1)),
        shock: { id: s.id, label: s.label, phrase: s.phrase, from: s.from, to: s.to, ages: s.ages },
      };
    }
  }

  return null;
}
