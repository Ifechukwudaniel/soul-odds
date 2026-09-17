import { FaDiceD6 } from "react-icons/fa";
import { GameCard } from "@/components/game/home/GameCard";
import { DrawStatCard } from "@/components/game/mortal-odds/stage/DrawStatCard";
import { HistoryTimeline } from "@/components/game/mortal-odds/stage/HistoryTimeline";

const IDLE_DESCRIPTION =
  "You'll be dealt a random human from all of history. The bookie sets the odds using only the birth year. Every step costs chips — use the clues to make them back.";

export const DrawHero = (props: { currentYear: number; onDraw: () => void; drawCost: number; canAfford: boolean }) => (
  <GameCard className="flex min-h-0 flex-1 flex-col items-center justify-center gap-1 overflow-y-auto py-10 text-center" containerClassName="flex h-full w-full flex-col">
    <p className="font-medium text-white/80 text-[11px] uppercase tracking-[0.2em]">Your person</p>

    <div className="w-full max-w-lg">
      <DrawStatCard yearLabel="0000" regionLabel="—" />
    </div>

    <div className="mt-1 max-w-md">
      <p className="font-medium text-sm text-white">Nobody drawn yet.</p>
      <p className="mt-1 text-[#b0aeb5] text-xs leading-[1.5]">{IDLE_DESCRIPTION}</p>
    </div>

    <button
      type="button"
      disabled={!props.canAfford}
      onClick={props.onDraw}
      className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-slate-950 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <FaDiceD6 size={20} />
      Draw a human · {props.drawCost}
    </button>
    {!props.canAfford && <p className="mt-1 text-[#F87171] text-xs">Not enough chips</p>}

    <div className="mt-8 w-full max-w-sm">
      <HistoryTimeline year={null} currentYear={props.currentYear} />
    </div>
  </GameCard>
);
