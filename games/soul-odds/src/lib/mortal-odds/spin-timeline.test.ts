import { describe, expect, it } from "vitest";
import { mulberry32 } from "@/lib/mortal-odds/rng";
import { buildSpinTimeline, CHART_INTRO_MS, HOP_ROLL_MS, reelTickOffsets, SETTLE_ROLL_MS } from "@/lib/mortal-odds/spin-timeline";
import type { SpinEvent } from "@/lib/mortal-odds/spin-timeline";

const build = (targetYear: number, seed = 1, introMs?: number) => buildSpinTimeline({ targetYear, minYear: -12000, maxYear: 2026, rng: mulberry32(seed), introMs });
const years = (events: SpinEvent[]) => events.flatMap((event) => (event.type === "year" ? [event] : []));

describe("reelTickOffsets", () => {
  it("ends the last click at the end of the roll", () => {
    const offsets = reelTickOffsets({ rollMs: 1000, count: 8 });
    expect(offsets).toHaveLength(8);
    expect(offsets.at(-1)).toBeCloseTo(1000);
  });

  it("spaces clicks further apart as the roll slows", () => {
    const offsets = reelTickOffsets({ rollMs: 1000, count: 8 });
    const gaps = offsets.map((offset, index) => offset - (offsets[index - 1] ?? 0));
    expect(gaps.every((gap, index) => index === 0 || gap > (gaps[index - 1] ?? 0))).toBe(true);
  });
});

describe("buildSpinTimeline", () => {
  it("lands on the target with the last year event", () => {
    const rolls = years(build(-5712).events);
    expect(rolls.at(-1)).toMatchObject({ year: -5712, landing: true });
    expect(rolls.filter((roll) => roll.landing)).toHaveLength(1);
  });

  it("never shows the answer before the landing", () => {
    for (let seed = 1; seed <= 200; seed++) {
      for (const target of [-12000, -5712, 383, 2026]) {
        const early = years(build(target, seed).events).filter((roll) => !roll.landing);
        expect(early.every((roll) => roll.year !== target)).toBe(true);
      }
    }
  });

  it("keeps every hop inside the timeline range", () => {
    for (let seed = 1; seed <= 100; seed++) {
      for (const roll of years(build(-9000, seed).events)) {
        expect(roll.year).toBeGreaterThanOrEqual(-12000);
        expect(roll.year).toBeLessThanOrEqual(2026);
      }
    }
  });

  it("orders events in time and locks after the landing roll settles", () => {
    const { events, totalMs } = build(-5712);
    expect(events.every((event, index) => index === 0 || event.atMs >= (events[index - 1]?.atMs ?? 0))).toBe(true);
    const landing = years(events).find((roll) => roll.landing);
    const lock = events.find((event) => event.type === "lock");
    expect(lock?.atMs).toBeCloseTo((landing?.atMs ?? 0) + SETTLE_ROLL_MS);
    expect(totalMs).toBeGreaterThan(lock?.atMs ?? Infinity);
  });

  it("finishes each hop roll before the next hop starts", () => {
    const rolls = years(build(-5712).events);
    rolls.forEach((roll, index) => {
      const next = rolls[index + 1];
      if (next && !next.landing) {
        expect(next.atMs - roll.atMs).toBeGreaterThan(HOP_ROLL_MS);
      }
    });
  });
});

describe("buildSpinTimeline intro", () => {
  it("holds every event back until the intro is over", () => {
    const { events } = build(-5712, 1, CHART_INTRO_MS);
    expect(Math.min(...events.map((event) => event.atMs))).toBeGreaterThanOrEqual(CHART_INTRO_MS);
  });

  it("shifts the whole timeline by the intro and nothing else", () => {
    const plain = build(-5712, 3);
    const withIntro = build(-5712, 3, CHART_INTRO_MS);
    expect(withIntro.totalMs).toBe(plain.totalMs + CHART_INTRO_MS);
    expect(withIntro.events).toHaveLength(plain.events.length);
    withIntro.events.forEach((event, index) => {
      expect(event.type).toBe(plain.events[index]?.type);
      expect(event.atMs - CHART_INTRO_MS).toBeCloseTo(plain.events[index]?.atMs ?? Infinity);
    });
  });
});

