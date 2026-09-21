import { bookieCurves, erasConfig, SIMS, sinsConfig, worldPopCurve } from "@/lib/mortal-odds/config";
import { placeContext } from "@/lib/mortal-odds/draw";
import type { BookieLife } from "@/lib/mortal-odds/model";
import { simulateBookie } from "@/lib/mortal-odds/model";
import { medianDeathYear } from "@/lib/mortal-odds/pricing";
import { createRng } from "@/lib/mortal-odds/rng";
import { previewCategoryPrices } from "@/lib/mortal-odds/soul-odds-contract";
import type { Draw, MarketPrices, PlaceContext } from "@/types";

/**
 * Everything about a round that follows from its drawn birth, its wager and one stored seed, so a
 * refreshed page can rebuild the exact same odds and samples instead of persisting thousands of them.
 */
export function deriveRoundData(options: { draw: Draw; wagerWei: bigint; samplesSeed: number; story: string; currentYear: number }): {
  context: PlaceContext;
  samples: BookieLife[];
  prices: MarketPrices;
  defaultDeathGuess: number;
} {
  const { draw, wagerWei, samplesSeed, story, currentYear } = options;
  const samples = simulateBookie({ year: draw.year, rng: createRng(samplesSeed), curves: bookieCurves, sins: sinsConfig, sims: SIMS });

  return {
    context: { ...placeContext({ draw, erasConfig, worldPopCurve, currentYear }), story },
    samples,
    prices: previewCategoryPrices(wagerWei),
    defaultDeathGuess: medianDeathYear(samples),
  };
}
