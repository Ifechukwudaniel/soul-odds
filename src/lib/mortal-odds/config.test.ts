import { describe, expect, it } from "vitest";
import { erasConfig, MODES, placesConfig, worldPopCurve } from "@/lib/mortal-odds/config";

const REGION_IDS = ["ssa", "mena", "eur", "sas", "eas", "sea", "ame"] as const;

describe("erasConfig", () => {
  it("loads and validates without throwing", () => {
    expect(erasConfig.length).toBeGreaterThan(0);
  });

  it("has only positive regional shares in every era", () => {
    for (const era of erasConfig) {
      for (const share of Object.values(era.shares)) {
        expect(share).toBeGreaterThan(0);
      }
    }
  });

  it("leaves only the last era open-ended", () => {
    const openEnded = erasConfig.filter((era) => era.to === null);
    expect(openEnded).toHaveLength(1);
    expect(erasConfig[erasConfig.length - 1]?.to).toBeNull();
  });
});

describe("placesConfig", () => {
  it("covers exactly the seven region ids", () => {
    expect(Object.keys(placesConfig).sort()).toEqual([...REGION_IDS].sort());
  });

  it("gives every region at least one place with a positive weight", () => {
    for (const places of Object.values(placesConfig)) {
      expect(places.length).toBeGreaterThan(0);
      for (const place of places) {
        expect(place.weight).toBeGreaterThan(0);
      }
    }
  });
});

describe("worldPopCurve", () => {
  it("is sorted by year and has at least two points", () => {
    expect(worldPopCurve.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < worldPopCurve.length; i++) {
      const prevYear = worldPopCurve[i - 1]?.[0] as number;
      const year = worldPopCurve[i]?.[0] as number;
      expect(year).toBeGreaterThan(prevYear);
    }
  });
});

describe("MODES", () => {
  it("maps every era filter to a numeric floor", () => {
    expect(MODES.all).toBe(-Infinity);
    expect(MODES.ce).toBe(1);
    expect(MODES.modern).toBe(1750);
  });
});
