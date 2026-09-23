import { describe, expect, it } from "vitest";
import { calibrateToWorld, checkPopulation } from "@/lib/mortal-odds/population-lint";

describe("checkPopulation", () => {
  const world = 200_000_000;

  it("accepts a plausible estimate", () => {
    expect(checkPopulation({ estimate: { low: 40e6, mid: 55e6, high: 70e6 }, areaKm2: 4_000_000, world, year: 100 })).toBeNull();
  });

  it("rejects a range out of order", () => {
    expect(checkPopulation({ estimate: { low: 60e6, mid: 55e6, high: 70e6 }, areaKm2: 4_000_000, world, year: 100 })).toContain("ascending");
  });

  it("rejects a density no territory averages", () => {
    expect(checkPopulation({ estimate: { low: 9e6, mid: 10e6, high: 11e6 }, areaKm2: 10_000, world, year: 100 })).toContain("per km²");
  });

  it("allows a modern country far denser than any ancient territory", () => {
    expect(checkPopulation({ estimate: { low: 16e6, mid: 17e6, high: 18e6 }, areaKm2: 41_500, world: 6e9, year: 2012 })).toBeNull();
  });

  it("rejects more than half the world's people", () => {
    expect(checkPopulation({ estimate: { low: 90e6, mid: 120e6, high: 150e6 }, areaKm2: 90_000_000, world, year: 100 })).toContain("world");
  });
});

describe("calibrateToWorld", () => {
  const row = (name: string, population: number, method: string) => ({ name, fromYear: 0, toYear: 100, population, low: population, high: population, method });

  it("scales estimated rows down when together they outnumber the world", () => {
    const rows = calibrateToWorld([row("A", 600, "llm"), row("B", 600, "llm")], () => 1000);
    expect(rows.map((r) => r.population)).toEqual([500, 500]);
  });

  it("leaves researched rows alone and ignores parenthesised duplicates in the total", () => {
    const rows = calibrateToWorld([row("A", 600, "seshat"), row("(A)", 600, "llm"), row("B", 300, "llm")], () => 1000);
    expect(rows.map((r) => r.population)).toEqual([600, 600, 300]);
  });
});
