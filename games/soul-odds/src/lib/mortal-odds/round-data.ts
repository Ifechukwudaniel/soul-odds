import { bookieCurves, SIMS, sinsConfig, worldPopCurve } from "@/lib/mortal-odds/config";
import type { EraConfig } from "@/lib/mortal-odds/config";
import { placeContext } from "@/lib/mortal-odds/draw";
import type { BookieLife } from "@/lib/mortal-odds/model";
import { simulateBookie } from "@/lib/mortal-odds/model";
import { medianDeathYear } from "@/lib/mortal-odds/pricing";
import { createRng } from "@/lib/mortal-odds/rng";
import { previewCategoryPrices } from "@/lib/mortal-odds/soul-odds-contract";
import type { Draw, MarketPrices, PlaceContext } from "@/types";

/**
 * Everything about a round that follows from its drawn birth, its wager and one stored seed, so a
 * refreshed page can rebuild the exact same odds and samples instead of persisting thousands of
 * them. `era` is the birth year's era, already resolved by the caller (the backend when reachable,
 * else the local fallback — see `useMortalOddsDraw.ts`), not looked up again here.
 */
export function deriveRoundData(options: { draw: Draw; era: EraConfig; wagerWei: bigint; samplesSeed: number; story: string; currentYear: number }): {
  context: PlaceContext;
  samples: BookieLife[];
  prices: MarketPrices;
  defaultDeathGuess: number;
} {
  const { draw, era, wagerWei, samplesSeed, story, currentYear } = options;
  const rng = createRng(samplesSeed);
  const samples = simulateBookie({ year: draw.year, rng, curves: bookieCurves, sins: sinsConfig, sims: SIMS });

  return {
    context: { ...placeContext({ draw, era, worldPopCurve, currentYear, rng }), story },
    samples,
    prices: previewCategoryPrices(wagerWei),
    defaultDeathGuess: medianDeathYear(samples),
  };
}
