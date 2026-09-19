import { interpolate } from "@/lib/mortal-odds/curves";
import { applyShocks } from "@/lib/mortal-odds/shocks";
import { pickSin } from "@/lib/mortal-odds/sins";
import type { RegionModifiersConfig, ShockConfig, SinConfig } from "@/lib/mortal-odds/config";
import type { Rng } from "@/lib/mortal-odds/rng";
import type { Life, RegionId, Sex, Shock } from "@/types";

export type BookieCurves = {
  q5: ReadonlyArray<readonly [number, number]>;
  adultMean: ReadonlyArray<readonly [number, number]>;
  adultSd: ReadonlyArray<readonly [number, number]>;
  literacy: ReadonlyArray<readonly [number, number]>;
  urban: ReadonlyArray<readonly [number, number]>;
};

export type BookieLife = { age: number; deathYear: number; literate: boolean; city: boolean; sin: string | null };

function clamp(x: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, x));
}

function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** A boy 51.2% of the time, matching the real sex ratio at birth. */
export function drawSex(rng: Rng): Sex {
  return rng() < 0.512 ? "boy" : "girl";
}

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
export function sampleLifeBookie(options: { year: number; rng: Rng; curves: BookieCurves; sins: SinConfig[] }): BookieLife {
  const { year, rng, curves, sins } = options;
  const q5 = Math.min(0.9, interpolate({ points: curves.q5, x: year }));
  const age =
    rng() < q5
      ? Math.floor(rng() ** 2 * 5)
      : adultAge({
          mean: interpolate({ points: curves.adultMean, x: year }),
          sd: interpolate({ points: curves.adultSd, x: year }),
          rng,
        });
  const deathYear = year + age;

  return {
    age,
    deathYear,
    literate: age >= 10 && rng() < Math.min(0.99, interpolate({ points: curves.literacy, x: year })),
    city: rng() < Math.min(0.95, interpolate({ points: curves.urban, x: year })),
    sin: pickSin({ year, deathYear, region: null, rng, sins })?.id ?? null,
  };
}

export function simulateBookie(options: { year: number; rng: Rng; curves: BookieCurves; sins: SinConfig[]; sims: number }): BookieLife[] {
  const { year, rng, curves, sins, sims } = options;
  const samples: BookieLife[] = new Array(sims);
  for (let i = 0; i < sims; i++) samples[i] = sampleLifeBookie({ year, rng, curves, sins });
  return samples;
}

function regionMod(options: { region: RegionId; year: number; mods: RegionModifiersConfig }): { q: number; shift: number } {
  const { region, year, mods } = options;
  const a = clamp((year - 1800) / 150, 0, 1);
  const b = clamp((year - 1950) / 40, 0, 1);
  const [iq, is] = mods.regionMods.industrial[region];
  const [mq, ms] = mods.regionMods.modern[region];
  return { q: mix(mix(1, iq, a), mq, b), shift: mix(mix(0, is, a), ms, b) };
}

function sexShift(options: { sex: Sex; year: number }): number {
  const w = clamp((options.year - 1900) / 60, 0, 1);
  return options.sex === "girl" ? 1 + 3 * w : -(1 + w);
}

function literacyP(options: {
  year: number;
  region: RegionId;
  sex: Sex;
  curve: ReadonlyArray<readonly [number, number]>;
  mods: RegionModifiersConfig;
}): number {
  const { year, region, sex, curve, mods } = options;
  const era = year < 1500 ? "ancient" : year < 1950 ? "early" : "modern";
  const r = mods.literacyMultiplier[era][region];
  const s = mods.sexLiteracyMultiplier[year < 1950 ? "old" : "new"][sex];
  return Math.min(0.99, interpolate({ points: curve, x: year }) * r * s);
}

function cityP(options: {
  year: number;
  region: RegionId;
  curve: ReadonlyArray<readonly [number, number]>;
  mods: RegionModifiersConfig;
}): number {
  const { year, region, curve, mods } = options;
  const r = mods.cityMultiplier[year < 1800 ? "old" : "new"][region];
  return Math.min(0.95, interpolate({ points: curve, x: year }) * r);
}

export type FullModelConfig = {
  curves: BookieCurves;
  mods: RegionModifiersConfig;
  shocks: ShockConfig[];
  sins: SinConfig[];
};

/** The full model: region, sex and catastrophes all shape the outcome, unlike the bookie's. */
export function sampleLife(options: {
  year: number;
  region: RegionId;
  sex: Sex;
  withHistory: boolean;
  rng: Rng;
  config: FullModelConfig;
}): Life {
  const { year, region, sex, withHistory, rng, config } = options;
  const mod = regionMod({ region, year, mods: config.mods });
  const sexQ5 = config.mods.sexChildMortalityMultiplier[sex];
  const q5 = Math.min(0.9, interpolate({ points: config.curves.q5, x: year }) * mod.q * sexQ5);

  let age =
    rng() < q5
      ? Math.floor(rng() ** 2 * 5)
      : adultAge({
          mean: interpolate({ points: config.curves.adultMean, x: year }) + mod.shift + sexShift({ sex, year }),
          sd: interpolate({ points: config.curves.adultSd, x: year }),
          rng,
        });

  let shock: Shock | null = null;
  if (withHistory) {
    const hit = applyShocks({ year, region, sex, age, rng, shocks: config.shocks });
    if (hit) {
      age = hit.age;
      shock = hit.shock;
    }
  }

  const deathYear = year + age;
  const sin = pickSin({ year, deathYear, region, rng, sins: config.sins });

  return {
    year,
    region,
    sex,
    age,
    shock,
    deathYear,
    literate: age >= 10 && rng() < literacyP({ year, region, sex, curve: config.curves.literacy, mods: config.mods }),
    city: rng() < cityP({ year, region, curve: config.curves.urban, mods: config.mods }),
    sin: sin ? { id: sin.id, label: sin.label, phrase: sin.phrase, from: sin.from, to: sin.to } : null,
  };
}

export function simulateFull(options: {
  year: number;
  region: RegionId;
  rng: Rng;
  config: FullModelConfig;
  sims: number;
}): Life[] {
  const { year, region, rng, config, sims } = options;
  const samples: Life[] = new Array(sims);
  for (let i = 0; i < sims; i++) {
    samples[i] = sampleLife({ year, region, sex: drawSex(rng), withHistory: true, rng, config });
  }
  return samples;
}
