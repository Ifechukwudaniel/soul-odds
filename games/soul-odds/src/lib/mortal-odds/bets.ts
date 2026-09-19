import { DEATH_WINDOW, marketsConfig } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { Bet, MarketPrices, Price } from "@/types";

export function betLabel(bet: Bet): { market: string; pick: string } {
  if (bet.kind === "range") {
    return { market: "Year of death", pick: `${fmtYear(bet.guessYear)} ± ${DEATH_WINDOW}` };
  }
  const market = marketsConfig.find((m) => m.id === bet.marketId);
  const option = market?.options.find((o) => o.id === bet.optionId);
  return { market: market?.title ?? bet.marketId, pick: option?.label ?? bet.optionId };
}

export function betOdds(options: { bet: Bet; prices: MarketPrices; priceDeathYear: (guessYear: number) => Price }): number | null {
  const { bet, prices, priceDeathYear } = options;
  if (bet.kind === "range") return priceDeathYear(bet.guessYear).odds;
  return prices[bet.marketId]?.[bet.optionId]?.odds ?? null;
}
