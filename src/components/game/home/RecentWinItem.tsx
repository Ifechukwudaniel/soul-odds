import { PlaceholderIcon } from "@/components/game/home/PlaceholderIcon";
import type { RecentWin } from "@/components/game/home/types";

export const RecentWinItem = (props: RecentWin) => (
  <div className="flex items-center gap-3">
    <PlaceholderIcon emoji={props.icon} className="h-9 w-9 bg-white/10 text-lg" />
    <div className="flex-1">
      <p className="text-sm font-semibold text-white">{props.name}</p>
      <p className="text-xs text-white/50">{props.multiplier.toFixed(2)}x</p>
    </div>
    <div className="flex items-center gap-1 text-sm font-bold text-[#9181F0]">
      +{props.amount.toFixed(2)}
      <PlaceholderIcon emoji="🔵" className="h-4 w-4 bg-transparent text-xs" />
    </div>
  </div>
);
