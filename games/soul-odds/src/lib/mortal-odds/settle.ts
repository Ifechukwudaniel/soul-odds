import { betLabel } from "@/lib/mortal-odds/bets";
import { DEATH_WINDOW, marketsConfig } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import { deathYearP, LIFE_RESOLVERS } from "@/lib/mortal-odds/pricing";
import type { Bet, BetResult, Life, MarketPrices, Price } from "@/types";

/**
 * Settles every bet against the life that actually happened. A losing bet's net is
 * just its stake; skill is the bet's expected value at the real odds (stake * (realP * odds - 1)),
 * so a smart bet that lost still scores and a lucky one does not.
 */
export function resolveBets(options: {
  life: Life;
  bets: Record<string, Bet>;
  prices: MarketPrices;
  priceDeathYear: (guessYear: number) => Price;
  trueProbabilities: Record<string, Record<string, number>>;
  truthSamples: Life[];
}): { results: BetResult[]; net: number; skill: number } {
  const { life, bets, prices, priceDeathYear, trueProbabilities, truthSamples } = options;
  const results: BetResult[] = [];

  for (const bet of Object.values(bets)) {
    if (bet.kind === "choice") {
      const market = marketsConfig.find((m) => m.id === bet.marketId);
      const resolve = LIFE_RESOLVERS[bet.marketId];
      const price = prices[bet.marketId]?.[bet.optionId];
      if (!market || !resolve || !price || price.odds === null) continue;

      const outcome = resolve(life);
      const won = outcome === bet.optionId;
      const realP = trueProbabilities[bet.marketId]?.[bet.optionId] ?? 0;
      const outcomeLabel = market.options.find((o) => o.id === outcome)?.label ?? outcome;

      results.push({
        marketId: bet.marketId,
        marketLabel: market.title,
        won,
        stake: bet.stake,
        net: won ? bet.stake * (price.odds - 1) : -bet.stake,
        skill: bet.stake * (realP * price.odds - 1),
        pickLabel: betLabel(bet).pick,
        outcomeLabel,
        bookieP: price.p,
        realP,
        odds: price.odds,
      });
    } else {
      const price = priceDeathYear(bet.guessYear);
      if (price.odds === null) continue;

      const won = Math.abs(life.deathYear - bet.guessYear) <= DEATH_WINDOW;
      const realP = deathYearP({ samples: truthSamples, guess: bet.guessYear, window: DEATH_WINDOW });

      results.push({
        marketId: "dy",
        marketLabel: "Year of death",
        won,
        stake: bet.stake,
        net: won ? bet.stake * (price.odds - 1) : -bet.stake,
        skill: bet.stake * (realP * price.odds - 1),
        pickLabel: betLabel(bet).pick,
        outcomeLabel: fmtYear(life.deathYear),
        bookieP: price.p,
        realP,
        odds: price.odds,
      });
    }
  }

  const net = Math.round(results.reduce((sum, r) => sum + r.net, 0) * 100) / 100;
  const skill = results.reduce((sum, r) => sum + r.skill, 0);
  return { results, net, skill };
}
