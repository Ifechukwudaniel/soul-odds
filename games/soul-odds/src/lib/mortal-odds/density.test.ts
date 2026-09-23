import { describe, expect, it } from "vitest";
import { erasConfig } from "@/lib/mortal-odds/config";
import { densityAt, populationFromDensity } from "@/lib/mortal-odds/density";

describe("densityAt", () => {
  it("is denser in a later, more populous year", () => {
    expect(densityAt({ year: 1800, region: "eur", erasConfig })).toBeGreaterThan(densityAt({ year: 100, region: "eur", erasConfig }));
  });

  it("is denser where a big share of people live on little land", () => {
    expect(densityAt({ year: 1500, region: "sas", erasConfig })).toBeGreaterThan(densityAt({ year: 1500, region: "ame", erasConfig }));
  });
});

describe("populationFromDensity", () => {
  it("scales with the territory's area", () => {
    const small = populationFromDensity({ year: 1500, region: "eur", areaKm2: 100_000, erasConfig });
    const large = populationFromDensity({ year: 1500, region: "eur", areaKm2: 200_000, erasConfig });
    expect(large).toBeCloseTo(small * 2);
  });

  it("never exceeds the world's population", () => {
    expect(populationFromDensity({ year: -5000, region: "sea", areaKm2: 1e12, erasConfig })).toBeLessThan(2e7);
  });
});
