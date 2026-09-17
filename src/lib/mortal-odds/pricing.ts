import type { BookieLife } from "@/lib/mortal-odds/model";
import type { ChanceTag, Life, MarketConfig, MarketPrices, Price } from "@/types";

export type PricingConfig = { houseEdge: number; maxOdds: number; minP: number };

/** payout = (1 - houseEdge) / p, clamped to [1.05x, maxOdds]; null closes the market below minP. */
export function toOdds(options: { p: number; config: PricingConfig }): number | null {
  const { p, config } = options;
  if (p < config.minP) return null;
  return Math.min(config.maxOdds, Math.max(1.05, (1 - config.houseEdge) / p));
}

export function chanceTag(p: number): ChanceTag {
  if (p >= 0.6) return "Likely";
  if (p >= 0.3) return "Toss-up";
  if (p >= 0.1) return "Unlikely";
  return "Long shot";
}

export function priceFromP(options: { p: number; config: PricingConfig }): Price {
  return { p: options.p, odds: toOdds(options), tag: chanceTag(options.p) };
}

const RESOLVERS: Record<string, (life: BookieLife) => string> = {
  age: (life) => (life.age < 5 ? "u5" : life.age < 30 ? "y" : life.age < 60 ? "m" : "o"),
  read: (life) => (life.literate ? "yes" : "no"),
  city: (life) => (life.city ? "yes" : "no"),
};

/** Prices every choice market's options from the bookie's year-only samples. */
export function computeMarketPrices(options: {
  markets: MarketConfig[];
  samples: BookieLife[];
  config: PricingConfig;
}): MarketPrices {
  const { markets, samples, config } = options;
  const prices: MarketPrices = {};

  for (const market of markets) {
    if (market.fixedBookieP) {
      prices[market.id] = Object.fromEntries(
        Object.entries(market.fixedBookieP).map(([optionId, p]) => [optionId, priceFromP({ p, config })]),
      );
      continue;
    }

    const resolve = RESOLVERS[market.id];
    if (!resolve) throw new Error(`No resolver for market "${market.id}"`);

    const counts: Record<string, number> = Object.fromEntries(market.options.map((o) => [o.id, 0]));
    for (const life of samples) {
      const outcome = resolve(life);
      counts[outcome] = (counts[outcome] ?? 0) + 1;
    }

    prices[market.id] = Object.fromEntries(
      market.options.map((o) => [o.id, priceFromP({ p: (counts[o.id] ?? 0) / samples.length, config })]),
    );
  }

  return prices;
}

/** Share of samples whose death year falls within `window` of `guess`. */
export function deathYearP(options: { samples: ReadonlyArray<{ deathYear: number }>; guess: number; window: number }): number {
  const { samples, guess, window } = options;
  let hits = 0;
  for (const life of samples) if (Math.abs(life.deathYear - guess) <= window) hits++;
  return hits / samples.length;
}

/** Median death year across the bookie samples, used to seed the year-of-death slider. */
export function medianDeathYear(samples: ReadonlyArray<{ deathYear: number }>): number {
  const sorted = [...samples].map((life) => life.deathYear).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted[mid] ?? 0;
}

/** Resolves a market's outcome id for one fully-simulated life; used both for real-probability counts and settlement. */
export const LIFE_RESOLVERS: Record<string, (life: Life) => string> = {
  sex: (life) => life.sex,
  age: (life) => (life.age < 5 ? "u5" : life.age < 30 ? "y" : life.age < 60 ? "m" : "o"),
  read: (life) => (life.literate ? "yes" : "no"),
  city: (life) => (life.city ? "yes" : "no"),
};

/** Real probabilities per market/option from the full model's truth samples (region, sex, catastrophes). */
export function computeTrueProbabilities(options: { markets: MarketConfig[]; samples: Life[] }): Record<string, Record<string, number>> {
  const { markets, samples } = options;
  const result: Record<string, Record<string, number>> = {};

  for (const market of markets) {
    const resolve = LIFE_RESOLVERS[market.id];
    if (!resolve) throw new Error(`No real-probability resolver for market "${market.id}"`);

    const counts: Record<string, number> = Object.fromEntries(market.options.map((o) => [o.id, 0]));
    for (const life of samples) {
      const outcome = resolve(life);
      counts[outcome] = (counts[outcome] ?? 0) + 1;
    }

    result[market.id] = Object.fromEntries(market.options.map((o) => [o.id, (counts[o.id] ?? 0) / samples.length]));
  }

  return result;
}
