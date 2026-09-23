import { describe, expect, it } from "vitest";
import { pickSin } from "@/lib/mortal-odds/sins";
import type { SinConfig } from "@/lib/mortal-odds/config";

const alwaysSin = { id: "theft", label: "Theft", phrase: "stole", from: -6000, to: null, rate: { all: 1 } } as unknown as SinConfig;

describe("pickSin", () => {
  it("never picks a sin for a child under five", () => {
    expect(pickSin({ year: 1900, age: 4, deathYear: 1904, region: null, rng: () => 0, sins: [alwaysSin] })).toBeNull();
  });

  it("picks a sin from age five", () => {
    expect(pickSin({ year: 1900, age: 5, deathYear: 1905, region: null, rng: () => 0, sins: [alwaysSin] })).toBe(alwaysSin);
  });
});
