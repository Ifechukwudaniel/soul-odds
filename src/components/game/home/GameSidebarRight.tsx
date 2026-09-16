import { BetPanel } from "@/components/game/home/BetPanel";
import { LeaderboardList } from "@/components/game/home/LeaderboardList";
import type { LeaderboardEntry } from "@/components/game/home/types";

export const GameSidebarRight = (props: {
  currency: string;
  betAmount: number;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  potentialWinMultiplier: number;
  onSelectAmount: (amount: number) => void;
  leaderboard: LeaderboardEntry[];
}) => (
  <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
    <BetPanel
      currency={props.currency}
      betAmount={props.betAmount}
      minAmount={props.minAmount}
      maxAmount={props.maxAmount}
      quickAmounts={props.quickAmounts}
      potentialWinMultiplier={props.potentialWinMultiplier}
      onSelectAmount={props.onSelectAmount}
    />
    <LeaderboardList entries={props.leaderboard} />
  </div>
);
