import { describe, expect, it } from "vitest";
import { resolveBets } from "@/lib/mortal-odds/settle";
import type { Bet, Life, MarketPrices, Price } from "@/types";

const LIFE: Life = { year: 1900, region: "eur", sex: "boy", age: 40, deathYear: 1940, shock: null, literate: true, city: false, sin: null };

const PRICES: MarketPrices = {
  sex: {
    boy: { p: 0.5, odds: 1.84, tag: "Toss-up" },
    girl: { p: 0.5, odds: 1.84, tag: "Toss-up" },
  },
  age: {
    m: { p: 0.4, odds: 2.3, tag: "Toss-up" },
  },
};

const priceDeathYear = (guessYear: number): Price =>
  guessYear === 1940 ? { p: 0.1, odds: 8.28, tag: "Long shot" } : { p: 0, odds: null, tag: "Long shot" };

describe("resolveBets", () => {
  it("nets stake * (odds - 1) on a win, and just -stake on a loss", () => {
    const bets: Record<string, Bet> = {
      sex: { marketId: "sex", kind: "choice", optionId: "boy", stake: 10 }, // wins: life.sex === "boy"
      age: { marketId: "age", kind: "choice", optionId: "m", stake: 10 }, // wins: life.age (40) is in 30-59 bracket
    };
    const { results } = resolveBets({
      life: LIFE,
      bets,
      prices: PRICES,
      priceDeathYear,
      trueProbabilities: { sex: { boy: 0.512, girl: 0.488 }, age: { m: 0.35 } },
      truthSamples: [LIFE],
    });

    const sexResult = results.find((r) => r.marketId === "sex");
    expect(sexResult?.won).toBe(true);
    expect(sexResult?.net).toBeCloseTo(10 * (1.84 - 1));
    expect(sexResult?.skill).toBeCloseTo(10 * (0.512 * 1.84 - 1));
  });

  it("a losing bet's net is exactly -stake, independent of odds", () => {
    const bets: Record<string, Bet> = { sex: { marketId: "sex", kind: "choice", optionId: "girl", stake: 10 } };
    const { results, net } = resolveBets({
      life: LIFE,
      bets,
      prices: PRICES,
      priceDeathYear,
      trueProbabilities: { sex: { boy: 0.512, girl: 0.488 } },
      truthSamples: [LIFE],
    });
    expect(results[0]?.won).toBe(false);
    expect(results[0]?.net).toBe(-10);
    expect(net).toBe(-10);
  });

  it("skill uses the real probability, not the bookie's, even for a losing bet", () => {
    const bets: Record<string, Bet> = { sex: { marketId: "sex", kind: "choice", optionId: "girl", stake: 10 } };
    const { results } = resolveBets({
      life: LIFE,
      bets,
      prices: PRICES,
      priceDeathYear,
      trueProbabilities: { sex: { boy: 0.512, girl: 0.488 } },
      truthSamples: [LIFE],
    });
    // Lost the bet (life.sex is "boy"), but skill is stake * (realP_girl * odds - 1), computed regardless of outcome.
    expect(results[0]?.skill).toBeCloseTo(10 * (0.488 * 1.84 - 1));
  });

  it("settles a year-of-death (range) bet the same way", () => {
    const bets: Record<string, Bet> = { dy: { marketId: "dy", kind: "range", guessYear: 1940, stake: 20 } };
    const { results } = resolveBets({
      life: LIFE,
      bets,
      prices: PRICES,
      priceDeathYear,
      trueProbabilities: {},
      truthSamples: [LIFE],
    });
    expect(results[0]?.won).toBe(true);
    expect(results[0]?.net).toBeCloseTo(20 * (8.28 - 1));
  });

  it("skips a bet whose market is closed (odds null)", () => {
    const bets: Record<string, Bet> = { dy: { marketId: "dy", kind: "range", guessYear: 1800, stake: 20 } };
    const { results, net, skill } = resolveBets({
      life: LIFE,
      bets,
      prices: PRICES,
      priceDeathYear,
      trueProbabilities: {},
      truthSamples: [LIFE],
    });
    expect(results).toHaveLength(0);
    expect(net).toBe(0);
    expect(skill).toBe(0);
  });
});
