import { DEATH_WINDOW, marketsConfig } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import { narrativeFor } from "@/lib/mortal-odds/sin-narrative-helpers";
import { categoriesOfSinOption } from "@/lib/mortal-odds/sin-selection";
import type { SinNarratives } from "@/lib/mortal-odds/openrouter";
import type { Bet, MarketPrices, Price } from "@/types";

export function betLabel(bet: Bet, sinNarratives?: SinNarratives | null): { market: string; pick: string } {
  if (bet.kind === "range") {
    return { market: "Year of death", pick: `${fmtYear(bet.guessYear)} ± ${DEATH_WINDOW}` };
  }
  const market = marketsConfig.find((m) => m.id === bet.marketId);
  const option = market?.options.find((o) => o.id === bet.optionId);
  // A single sin reads as its era-specific phrase; a pair is too long for that, so it keeps its "A + B" label.
  const sinCategories = bet.marketId === "sins" ? categoriesOfSinOption(bet.optionId) : [];
  const phrase = sinCategories.length === 1 ? narrativeFor(sinNarratives ?? null, bet.optionId)?.phrase : undefined;
  return { market: market?.title ?? bet.marketId, pick: phrase ?? option?.label ?? bet.optionId };
}

export function betOdds(options: { bet: Bet; prices: MarketPrices; priceDeathYear: (guessYear: number) => Price }): number | null {
  const { bet, prices, priceDeathYear } = options;
  if (bet.kind === "range") return priceDeathYear(bet.guessYear).odds;
  return prices[bet.marketId]?.[bet.optionId]?.odds ?? null;
}
