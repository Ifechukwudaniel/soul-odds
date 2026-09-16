import { BetPanel } from "@/components/game/home/BetPanel";
import { RecentWinsList } from "@/components/game/home/RecentWinsList";
import type { RecentWin } from "@/components/game/home/types";

export const GameSidebarRight = (props: {
  currency: string;
  betAmount: number;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  potentialWinMultiplier: number;
  onSelectAmount: (amount: number) => void;
  recentWins: RecentWin[];
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
    <RecentWinsList wins={props.recentWins} />
  </div>
);
