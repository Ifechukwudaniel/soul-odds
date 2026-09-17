import { betLabel } from "@/lib/mortal-odds/bets";
import { playClickSound } from "@/utils/playClickSound";
import type { Bet } from "@/types";

export const SlipRow = (props: { bet: Bet; potentialWin: number | null; currency: string; onRemove: () => void }) => {
  const label = betLabel(props.bet);

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2">
      <div>
        <span className="block text-white/50 text-xs">{label.market}</span>
        <span className="font-semibold text-sm text-white">{label.pick}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-bold text-[#F5B83D] text-sm">
          {props.potentialWin === null ? "—" : `${props.potentialWin.toFixed(2)} ${props.currency}`}
        </span>
        <button
          type="button"
          aria-label="Remove bet"
          onClick={() => {
            playClickSound();
            props.onRemove();
          }}
          className="text-white/40 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
