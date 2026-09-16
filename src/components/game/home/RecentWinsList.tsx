import { GameCard } from "@/components/game/home/GameCard";
import { RecentWinItem } from "@/components/game/home/RecentWinItem";
import type { RecentWin } from "@/components/game/home/types";

export const RecentWinsList = (props: { wins: RecentWin[] }) => (
  <GameCard className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-white">Recent Wins</h2>
      <button type="button" className="text-sm text-white/50 hover:text-white">
        View All →
      </button>
    </div>
    <div className="flex flex-col gap-3">
      {props.wins.map((win) => (
        <RecentWinItem key={win.name} {...win} />
      ))}
    </div>
  </GameCard>
);
