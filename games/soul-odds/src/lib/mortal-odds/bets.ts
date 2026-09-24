import { DEATH_WINDOW, marketsConfig } from '@/lib/mortal-odds/config';
import { fmtYear } from '@/lib/mortal-odds/format';
import { narrativeFor } from '@/lib/mortal-odds/sin-narrative-helpers';
import { categoriesOfSinOption } from '@/lib/mortal-odds/sin-selection';
import type { SinNarratives } from '@/lib/mortal-odds/sin-variants';
import type { Bet, MarketPrices, Price, RoundCharge } from '@/types';

export function betLabel(
  bet: Bet,
  sinNarratives?: SinNarratives | null,
): { market: string; pick: string } {
  if (bet.kind === 'range') {
    return { market: 'Year of death', pick: `${fmtYear(bet.guessYear)} ± ${DEATH_WINDOW}` };
  }
  const market = marketsConfig.find((m) => m.id === bet.marketId);
  const option = market?.options.find((o) => o.id === bet.optionId);
  // ✦ A single sin reads as its era-specific phrase; a pair is too long for that, so it keeps its "A + B" label.
  const sinCategories = bet.marketId === 'sins' ? categoriesOfSinOption(bet.optionId) : [];
  const phrase =
    sinCategories.length === 1
      ? narrativeFor(sinNarratives ?? null, bet.optionId)?.phrase
      : undefined;
  return { market: market?.title ?? bet.marketId, pick: phrase ?? option?.label ?? bet.optionId };
}

export function betOdds(options: {
  bet: Bet;
  prices: MarketPrices;
  priceDeathYear: (guessYear: number) => Price;
}): number | null {
  const { bet, prices, priceDeathYear } = options;
  if (bet.kind === 'range') return priceDeathYear(bet.guessYear).odds;
  return prices[bet.marketId]?.[bet.optionId]?.odds ?? null;
}

/** Totals shown on the wager slip: each pick's potential win, their sum, the stake at risk and the picks still to make. */
export function slipTotals(options: {
  bets: Record<string, Bet>;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  charges: RoundCharge[];
  requiredBets: number;
}) {
  const bets = Object.values(options.bets);
  const potentialWins = bets.map((bet) => {
    if (!options.prices) return null;
    const odds = betOdds({ bet, prices: options.prices, priceDeathYear: options.priceDeathYear });
    return odds === null ? null : bet.stake * odds;
  });
  const totalPotentialWin = potentialWins.reduce((sum: number, win) => sum + (win ?? 0), 0);
  // ✦ Bet stakes are a breakdown of the "stake" charge already locked in at summon, not additional spend.
  const atRisk = options.charges.reduce((sum, charge) => sum + charge.amount, 0);
  const unpicked = Math.max(0, options.requiredBets - bets.length);
  return { bets, potentialWins, totalPotentialWin, atRisk, unpicked };
}
