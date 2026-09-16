import { GameCard } from "@/components/game/home/GameCard";
import { LeaderboardItem } from "@/components/game/home/LeaderboardItem";
import type { LeaderboardEntry } from "@/components/game/home/types";

export const LeaderboardList = (props: { entries: LeaderboardEntry[] }) => (
  <GameCard className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <h2 className="font-bold text-white">Leaderboard</h2>
      <button type="button" className="text-sm text-white/50 hover:text-white">
        View All →
      </button>
    </div>
    <div className="flex flex-col gap-3">
      {props.entries.map((entry) => (
        <LeaderboardItem key={entry.rank} {...entry} />
      ))}
    </div>
  </GameCard>
);
