import type { Rng } from "@/lib/mortal-odds/rng";

/** How long the reel takes to roll to a hop year: quick, so the search reads as frantic. */
export const HOP_ROLL_MS = 300;
/** How long the chart takes to draw itself in on the first draw of a round; the search starts once it is done. */
export const CHART_INTRO_MS = 1400;
/** How long the final roll onto the answer takes: slow and decelerating, like a reel coming to rest. */
export const SETTLE_ROLL_MS = 1300;

const FIRST_HOP_MS = 300;
const HOP_SPACING_MS = 340;
const RANDOM_HOPS = 3;
const HOP_TICKS = 3;
const SETTLE_TICKS = 8;
const HOLD_MS = 200;
/** The last hop before the answer misses by up to this share of the timeline, so the landing feels close. */
const NEAR_MISS_SHARE = 0.04;

export type SpinEvent = { atMs: number } & (
  | { type: "year"; year: number; landing: boolean }
  | { type: "tick"; step: number }
  | { type: "lock" }
);

/** Offsets (ms into a roll) of `count` clicks that space out as the roll decelerates; the last lands at `rollMs`. */
export const reelTickOffsets = (options: { rollMs: number; count: number }) =>
  Array.from({ length: options.count }, (_, index) => options.rollMs * (1 - Math.sqrt(1 - (index + 1) / options.count)));

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Plans the year search as one timeline that drives the reel, the chart marker and the sounds:
 * a few quick hops across history, a near miss, then a slow roll onto the answer and a lock.
 * Only the final year event carries the answer; no earlier hop ever equals it.
 * `introMs` holds the search back while the chart draws itself in (first draw only; a redraw starts at once).
 */
export const buildSpinTimeline = (options: { targetYear: number; minYear: number; maxYear: number; rng: Rng; introMs?: number }) => {
  const { targetYear, minYear, maxYear, rng } = options;
  const startMs = (options.introMs ?? 0) + FIRST_HOP_MS;
  const span = maxYear - minYear;

  const randomYears = Array.from({ length: RANDOM_HOPS }, () => Math.round(minYear + rng() * span));
  const direction = rng() < 0.5 ? -1 : 1;
  const nearMiss = Math.round(clamp(targetYear + direction * span * NEAR_MISS_SHARE * (0.25 + rng() * 0.75), minYear, maxYear));
  const hopYears = [...randomYears, nearMiss].map((year) => (year === targetYear ? (year < maxYear ? year + 1 : year - 1) : year));

  const events: SpinEvent[] = [];
  hopYears.forEach((year, index) => {
    const atMs = startMs + index * HOP_SPACING_MS;
    events.push({ atMs, type: "year", year, landing: false });
    reelTickOffsets({ rollMs: HOP_ROLL_MS, count: HOP_TICKS }).forEach((offset, step) => events.push({ atMs: atMs + offset, type: "tick", step }));
  });

  const landingAtMs = startMs + hopYears.length * HOP_SPACING_MS;
  events.push({ atMs: landingAtMs, type: "year", year: targetYear, landing: true });
  reelTickOffsets({ rollMs: SETTLE_ROLL_MS, count: SETTLE_TICKS }).forEach((offset, step) => events.push({ atMs: landingAtMs + offset, type: "tick", step }));
  events.push({ atMs: landingAtMs + SETTLE_ROLL_MS, type: "lock" });

  events.sort((a, b) => a.atMs - b.atMs);
  return { events, totalMs: landingAtMs + SETTLE_ROLL_MS + HOLD_MS };
};
