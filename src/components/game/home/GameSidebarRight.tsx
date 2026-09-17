import { BetPanel } from "@/components/game/home/BetPanel";
import { LeaderboardList } from "@/components/game/home/LeaderboardList";
import type { LeaderboardEntry } from "@/components/game/home/types";
import type { Bet, MarketPrices, Price } from "@/types";

export const GameSidebarRight = (props: {
  currency: string;
  chipSize: number;
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  bets: Record<string, Bet>;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  onRemoveBet: (marketId: string) => void;
  leaderboard: LeaderboardEntry[];
}) => (
  <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
    <BetPanel
      currency={props.currency}
      chipSize={props.chipSize}
      quickAmounts={props.quickAmounts}
      onSelectChip={props.onSelectChip}
      bets={props.bets}
      prices={props.prices}
      priceDeathYear={props.priceDeathYear}
      onRemoveBet={props.onRemoveBet}
    />
    <LeaderboardList entries={props.leaderboard} />
  </div>
);
