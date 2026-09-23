import { describe, expect, it } from "vitest";
import { erasConfig, placesConfig, worldPopCurve } from "@/lib/mortal-odds/config";
import { drawBirth, pickPlace, placeContext, regionShare } from "@/lib/mortal-odds/draw";
import { eraFor } from "@/lib/mortal-odds/geo";
import { mulberry32 } from "@/lib/mortal-odds/rng";
import type { EraFilter } from "@/types";

const CURRENT_YEAR = 2024;

describe("drawBirth", () => {
  it("is deterministic for a fixed seed", () => {
    const first = drawBirth({ era: "all", rng: mulberry32(1234), erasConfig, currentYear: CURRENT_YEAR });
    const second = drawBirth({ era: "all", rng: mulberry32(1234), erasConfig, currentYear: CURRENT_YEAR });
    expect(first).toEqual(second);
  });

  it.each<[EraFilter, number]>([
    ["all", -Infinity],
    ["ce", 1],
    ["modern", 1750],
  ])("never draws a year before the '%s' filter's floor", (era, floor) => {
    const rng = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const { year } = drawBirth({ era, rng, erasConfig, currentYear: CURRENT_YEAR });
      expect(year).toBeGreaterThanOrEqual(floor === -Infinity ? -6000 : floor);
    }
  });

  it("never draws the current year or later", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 50; i++) {
      const { year } = drawBirth({ era: "all", rng, erasConfig, currentYear: CURRENT_YEAR });
      expect(year).toBeLessThan(CURRENT_YEAR);
    }
  });
});

describe("pickPlace", () => {
  it("returns a place from the requested region with a share between 0 and 1", () => {
    const place = pickPlace({ region: "eur", rng: mulberry32(5), placesConfig });
    const names = placesConfig.eur.map((p) => `${p.name}, ${p.continent}`);
    expect(names).toContain(place.name);
    expect(place.share).toBeGreaterThan(0);
    expect(place.share).toBeLessThanOrEqual(1);
  });
});

describe("regionShare", () => {
  it("sums to 1 across all regions for a given year", () => {
    const total = (["ssa", "mena", "eur", "sas", "eas", "sea", "ame"] as const)
      .map((region) => regionShare({ year: 1000, region, erasConfig }))
      .reduce((sum, share) => sum + share, 0);
    expect(total).toBeCloseTo(1);
  });

  it("resolves years in the open-ended final era", () => {
    const share = regionShare({ year: CURRENT_YEAR - 1, region: "eas", erasConfig });
    expect(share).toBeGreaterThan(0);
  });
});

describe("placeContext", () => {
  it("produces the expected sentences for a fixed draw", () => {
    const draw = { year: 1000, region: "eur" as const, place: { name: "Iberia, Europe", share: 0.2, lat: 40, lon: -4 } };
    const era = eraFor({ year: draw.year, erasConfig });
    const context = placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(1234) });
    expect(context.where).toBe("Iberia, Europe");
    expect(context.local).toMatch(/^About .+ people lived there then\.$/);
    expect(context.when).toMatch(/^1,024 years ago, Middle Ages\. About .+ people were alive, \d+\.\d{3}% of all humans ever\.$/);
  });

  describe("a real historical polity's attested date range", () => {
    const draw = { year: 1500, region: "eur" as const, place: { name: "Lyon, Europe", fromYear: 1350, toYear: 1964, lat: 45.7, lon: 4.8 } };
    const era = eraFor({ year: draw.year, erasConfig });

    it("mentions both attested years, in some varied phrasing", () => {
      const context = placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(1) });
      expect(context.local).toContain("1350");
      expect(context.local).toContain("1964");
    });

    it("is deterministic for a fixed seed", () => {
      const first = placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(42) });
      const second = placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(42) });
      expect(first.local).toBe(second.local);
    });

    it("varies its phrasing across seeds", () => {
      const phrasings = new Set(
        Array.from({ length: 20 }, (_, seed) => placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(seed) }).local),
      );
      expect(phrasings.size).toBeGreaterThan(1);
    });
  });

  describe("a polity whose attested range reaches the Cliopatria dataset's cutoff", () => {
    // The dataset stops tracking at 2023; a range ending there means "still standing", not "dissolved in 2023".
    const draw = { year: 1500, region: "eur" as const, place: { name: "Lyon, Europe", fromYear: 1551, toYear: 2023, lat: 45.7, lon: 4.8 } };
    const era = eraFor({ year: draw.year, erasConfig });

    it("says it still stands, without naming 2023 as an end date", () => {
      const context = placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(1) });
      expect(context.local).toContain("1551");
      expect(context.local).not.toContain("2023");
    });

    it("varies its phrasing across seeds", () => {
      const phrasings = new Set(
        Array.from({ length: 20 }, (_, seed) => placeContext({ draw, era, worldPopCurve, currentYear: CURRENT_YEAR, rng: mulberry32(seed) }).local),
      );
      expect(phrasings.size).toBeGreaterThan(1);
    });
  });
});
