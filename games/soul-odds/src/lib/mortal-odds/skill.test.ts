import { describe, expect, it } from "vitest";
import { accumulateSkill, computeBetSkill } from "@/lib/mortal-odds/skill";

describe("computeBetSkill", () => {
  it("scores positive when the real odds beat even money", () => {
    expect(computeBetSkill({ stake: 10, realP: 0.6, odds: 2 })).toBeCloseTo(10 * (0.6 * 2 - 1));
  });

  it("scores negative when the real odds are worse than even money", () => {
    expect(computeBetSkill({ stake: 10, realP: 0.2, odds: 2 })).toBeLessThan(0);
  });

  it("scales linearly with stake", () => {
    const unit = computeBetSkill({ stake: 1, realP: 0.4, odds: 3 });
    expect(computeBetSkill({ stake: 25, realP: 0.4, odds: 3 })).toBeCloseTo(unit * 25);
  });
});

describe("accumulateSkill", () => {
  it("adds a positive delta onto the running total", () => {
    expect(accumulateSkill(100, 20)).toBe(120);
  });

  it("still subtracts a negative delta, rather than flooring at the current total", () => {
    expect(accumulateSkill(100, -150)).toBe(-50);
  });
});
