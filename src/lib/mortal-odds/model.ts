import { interpolate } from "@/lib/mortal-odds/curves";
import type { Rng } from "@/lib/mortal-odds/rng";

export type BookieCurves = {
  q5: ReadonlyArray<readonly [number, number]>;
  adultMean: ReadonlyArray<readonly [number, number]>;
  adultSd: ReadonlyArray<readonly [number, number]>;
  literacy: ReadonlyArray<readonly [number, number]>;
  urban: ReadonlyArray<readonly [number, number]>;
};

export type BookieLife = { age: number; deathYear: number; literate: boolean; city: boolean };

/** Box-Muller normal sample. */
function normal(options: { mean: number; sd: number; rng: Rng }): number {
  const u = 1 - options.rng();
  const v = options.rng();
  return options.mean + options.sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Truncated-normal adult age (5-105), retried up to 20 times before clamping the mean. */
function adultAge(options: { mean: number; sd: number; rng: Rng }): number {
  for (let i = 0; i < 20; i++) {
    const age = normal(options);
    if (age >= 5 && age <= 105) return Math.round(age);
  }
  return Math.round(Math.min(105, Math.max(5, options.mean)));
}

/**
 * The bookie's year-only life model: no region, sex or catastrophes, matching what
 * the odds are priced on. This must stay simpler than the full model on purpose.
 */
export function sampleLifeBookie(options: { year: number; rng: Rng; curves: BookieCurves }): BookieLife {
  const { year, rng, curves } = options;
  const q5 = Math.min(0.9, interpolate({ points: curves.q5, x: year }));
  const age =
    rng() < q5
      ? Math.floor(rng() ** 2 * 5)
      : adultAge({
          mean: interpolate({ points: curves.adultMean, x: year }),
          sd: interpolate({ points: curves.adultSd, x: year }),
          rng,
        });

  return {
    age,
    deathYear: year + age,
    literate: age >= 10 && rng() < Math.min(0.99, interpolate({ points: curves.literacy, x: year })),
    city: rng() < Math.min(0.95, interpolate({ points: curves.urban, x: year })),
  };
}

export function simulateBookie(options: { year: number; rng: Rng; curves: BookieCurves; sims: number }): BookieLife[] {
  const { year, rng, curves, sims } = options;
  const samples: BookieLife[] = new Array(sims);
  for (let i = 0; i < sims; i++) samples[i] = sampleLifeBookie({ year, rng, curves });
  return samples;
}
