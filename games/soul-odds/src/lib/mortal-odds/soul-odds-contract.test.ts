import { encodeAbiParameters } from "viem";
import { describe, expect, it } from "vitest";
import {
  buildPrediction,
  configurationIndexFromGameState,
  previewCategoryPrices,
  previewSinsPrices,
  soulOddsConfigurations,
} from "@/lib/mortal-odds/soul-odds-contract";
import type { Bet } from "@/types";

const WAGER = 10n ** 19n;
const bet = (marketId: string, optionId: string): Bet => ({ marketId, kind: "choice", optionId, stake: 1 });

describe("previewSinsPrices", () => {
  it("prices every crime state the contract accepts: none, four singles and six pairs", () => {
    const options = Object.keys(previewSinsPrices(WAGER, 2, 0));
    expect(options).toHaveLength(11);
    expect(options).toContain("violence+heresy");
    expect(options).toContain("none");
  });

  it("pays the multiplier on a category's third of the wager, rtp / p", () => {
    const rtp = Number(soulOddsConfigurations[0]!.rtpWad) / 1e18;
    for (const price of Object.values(previewSinsPrices(WAGER, 2, 0))) {
      expect(price.odds).toBeCloseTo(rtp / price.p, 2);
    }
  });

  it("pins to one era's odds instead of averaging every era", () => {
    const perEra = soulOddsConfigurations.map((_configuration, index) => previewSinsPrices(WAGER, 2, index).heresy!.odds!);
    expect(Math.max(...perEra)).toBeGreaterThan(Math.min(...perEra) * 2);
  });

  it("before the era is known, pays the multiplier that goes with the average chance, not the average multiplier", () => {
    const rtp = Number(soulOddsConfigurations[0]!.rtpWad) / 1e18;
    const perEra = soulOddsConfigurations.map((_configuration, index) => previewSinsPrices(WAGER, 2, index).heresy!.odds!);
    const average = previewSinsPrices(WAGER, 2).heresy!;
    expect(average.odds).toBeCloseTo(rtp / average.p, 6);
    expect(average.odds).toBeLessThan(perEra.reduce((sum, odds) => sum + odds, 0) / perEra.length);
  });

  it("prices a pair below the odds of naming only one of its sins wrong", () => {
    const prices = previewSinsPrices(WAGER, 2, 0);
    expect(prices["violence+greed"]!.p).toBeLessThan(prices.violence!.p);
  });
});

describe("previewCategoryPrices", () => {
  it("prices a 5 to 29 death near 8x before the era is known, and no era pays a silly amount for it", () => {
    const { age } = previewCategoryPrices(WAGER);
    expect(age.y!.odds).toBeCloseTo(8, 0);
    const perEra = soulOddsConfigurations.map((_configuration, index) => previewCategoryPrices(WAGER, 0, index).age.y!.odds!);
    expect(Math.max(...perEra)).toBeLessThan(40);
  });

  it("makes the youngest and oldest ages likelier to be missed in the era they are rare", () => {
    const first = previewCategoryPrices(WAGER, 0, 0).age;
    const last = previewCategoryPrices(WAGER, 0, soulOddsConfigurations.length - 1).age;
    expect(last.o!.p).toBeGreaterThan(first.o!.p);
    expect(last.u5!.p).toBeLessThan(first.u5!.p);
  });

  it("pins sex and age to the same era as the sins", () => {
    const pinned = previewCategoryPrices(WAGER, 2, 3);
    expect(pinned.sins).toEqual(previewSinsPrices(WAGER, 2, 3));
  });
});

describe("buildPrediction", () => {
  it("encodes a pair of sins as two crime bits", () => {
    const prediction = buildPrediction({ sex: bet("sex", "girl"), age: bet("age", "m"), sins: bet("sins", "violence+greed") });
    expect(prediction).toEqual({ gender: 1, lifespanBucket: 2, sins: true, crimeMask: 0b0101 });
  });

  it("encodes a clean heart as no crime", () => {
    const prediction = buildPrediction({ sex: bet("sex", "boy"), age: bet("age", "u5"), sins: bet("sins", "none") });
    expect(prediction).toEqual({ gender: 0, lifespanBucket: 0, sins: false, crimeMask: 0 });
  });
});

describe("configurationIndexFromGameState", () => {
  it("reads the era index the contract stored", () => {
    expect(configurationIndexFromGameState(encodeAbiParameters([{ type: "uint256" }], [3n]))).toBe(3);
  });

  it("returns null for an empty state or an index past the title's eras", () => {
    expect(configurationIndexFromGameState("0x")).toBeNull();
    expect(configurationIndexFromGameState(encodeAbiParameters([{ type: "uint256" }], [99n]))).toBeNull();
  });
});
