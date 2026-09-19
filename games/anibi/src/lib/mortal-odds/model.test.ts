import { describe, expect, it } from "vitest";
import { bookieCurves, regionModifiersConfig, shocksConfig } from "@/lib/mortal-odds/config";
import { drawSex, sampleLife, sampleLifeBookie, simulateFull } from "@/lib/mortal-odds/model";
import { mulberry32 } from "@/lib/mortal-odds/rng";
import type { FullModelConfig } from "@/lib/mortal-odds/model";

const config: FullModelConfig = { curves: bookieCurves, mods: regionModifiersConfig, shocks: shocksConfig };

describe("drawSex", () => {
  it("returns roughly 51.2% boys over many draws", () => {
    const rng = mulberry32(1);
    let boys = 0;
    const total = 5000;
    for (let i = 0; i < total; i++) if (drawSex(rng) === "boy") boys++;
    expect(boys / total).toBeGreaterThan(0.47);
    expect(boys / total).toBeLessThan(0.55);
  });
});

describe("sampleLifeBookie", () => {
  it("never dies before being born or past 105", () => {
    const rng = mulberry32(3);
    for (let i = 0; i < 200; i++) {
      const { age } = sampleLifeBookie({ year: 1000, rng, curves: bookieCurves });
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThanOrEqual(105);
    }
  });
});

describe("sampleLife", () => {
  it("is deterministic for a fixed seed", () => {
    const a = sampleLife({ year: 1940, region: "eur", sex: "boy", withHistory: true, rng: mulberry32(9), config });
    const b = sampleLife({ year: 1940, region: "eur", sex: "boy", withHistory: true, rng: mulberry32(9), config });
    expect(a).toEqual(b);
  });

  it("never applies a shock when withHistory is false", () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 200; i++) {
      const life = sampleLife({ year: 1940, region: "eur", sex: "boy", withHistory: false, rng, config });
      expect(life.shock).toBeNull();
    }
  });

  it("sets deathYear to year + age", () => {
    const life = sampleLife({ year: 1500, region: "eas", sex: "girl", withHistory: true, rng: mulberry32(11), config });
    expect(life.deathYear).toBe(life.year + life.age);
  });
});

describe("simulateFull", () => {
  it("returns the requested number of samples, each with a valid age", () => {
    const samples = simulateFull({ year: 1900, region: "ssa", rng: mulberry32(2), config, sims: 50 });
    expect(samples).toHaveLength(50);
    for (const s of samples) {
      expect(s.age).toBeGreaterThanOrEqual(0);
      expect(s.age).toBeLessThanOrEqual(105);
    }
  });
});
