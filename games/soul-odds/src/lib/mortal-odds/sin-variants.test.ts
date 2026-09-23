import { describe, expect, it } from "vitest";
import { periodOf, withPeriod } from "@/lib/mortal-odds/sin-variants";
import type { SinNarratives } from "@/lib/mortal-odds/sin-variants";

const entry = { label: "Theft", phrase: "stole grain" };
const narratives: SinNarratives = { violence: entry, deceit: entry, greed: entry, heresy: entry };

describe("periodOf", () => {
  it("uses 500-year windows before year 0", () => {
    expect(periodOf(-2100)).toEqual({ fromYear: -2500, toYear: -2001 });
  });

  it("uses 250-year windows from year 0 to 1500", () => {
    expect(periodOf(300)).toEqual({ fromYear: 250, toYear: 499 });
  });

  it("uses 100-year windows from 1500 to 1900", () => {
    expect(periodOf(1650)).toEqual({ fromYear: 1600, toYear: 1699 });
  });

  it("uses 50-year windows in the 1900s", () => {
    expect(periodOf(1961)).toEqual({ fromYear: 1950, toYear: 1999 });
  });

  it("uses 25-year windows from 2000", () => {
    expect(periodOf(2012)).toEqual({ fromYear: 2000, toYear: 2024 });
  });

  it("makes every year fall in exactly one window, with neighbours abutting", () => {
    for (const year of [-1, 0, 1499, 1500, 1899, 1900, 1999, 2000]) {
      const { fromYear, toYear } = periodOf(year);
      expect(fromYear <= year && year <= toYear).toBe(true);
      expect(periodOf(toYear + 1).fromYear).toBe(toYear + 1);
    }
  });
});

describe("withPeriod", () => {
  it("adds the year's window to the narratives", () => {
    expect(withPeriod(narratives, 300)).toEqual({ ...narratives, fromYear: 250, toYear: 499 });
  });
});
