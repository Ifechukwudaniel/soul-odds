import { HeartGreen } from "@/components/assets/HeartGreen";
import { Lightning } from "@/components/assets/Lightning";
import { playClickSound } from "@/utils/playClickSound";
import type { GameMode } from "@/components/game/home/types";

export const ModeSwitcher = (props: {
  activeMode: GameMode;
  blitzTimeLabel: string;
  onSelectMode: (mode: GameMode) => void;
}) => (
  <div className="flex items-center gap-1 rounded-full border border-white/10 bg-slate-900/60 p-1">
    <button
      type="button"
      onClick={() => {
        playClickSound();
        props.onSelectMode("survival");
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
        props.activeMode === "survival"
          ? "border border-[#6752EF] bg-[#6752EF]/10 text-[#9181F0]"
          : "border border-transparent text-white/60"
      }`}
    >
      <HeartGreen width={20} height="20" />
      Survival
    </button>
    <button
      type="button"
      onClick={() => {
        playClickSound();
        props.onSelectMode("blitz");
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
        props.activeMode === "blitz"
          ? "border border-[#6752EF] bg-[#6752EF]/10 text-[#9181F0]"
          : "border border-transparent text-white/60"
      }`}
    >
      <Lightning width={15} height="20" />
      Blitz
      <span className="rounded bg-white/10 px-1.5 py-0.5 text-xs">{props.blitzTimeLabel}</span>
    </button>
  </div>
);
