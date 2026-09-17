import type { LeaderboardEntry } from "@/components/game/home/types";

export const LeaderboardItem = (props: LeaderboardEntry) => (
  <div className="flex items-center gap-3">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white">
      {props.rank}
    </span>
    <p className="flex-1 text-sm font-semibold text-white">{props.name}</p>
    <p className="text-sm font-bold text-[#9181F0]">{props.score.toLocaleString()} pts</p>
  </div>
);
