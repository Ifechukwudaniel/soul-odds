import { FaTrophy } from "react-icons/fa";
import { playClickSound } from "@/utils/playClickSound";

export const LeaderboardRankRow = (props: { rank: number; onClick?: () => void }) => (
  <button
    type="button"
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
  >
    <FaTrophy className="h-6 w-6 shrink-0 text-amber-400" />
    <p className="flex-1 text-left text-sm text-white/60">Leaderboard Rank</p>
    <p className="font-bold text-[#9181F0]">#{props.rank.toLocaleString()}</p>
    <span className="text-white/40">›</span>
  </button>
);
