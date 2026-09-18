import { GiAnubis } from "react-icons/gi";
import { GameCard } from "@/components/game/home/GameCard";
import { HUMANS_EVER } from "@/lib/mortal-odds/config";
import { fmtNumber } from "@/lib/mortal-odds/format";
import { ButtonDemo } from "@/components/assets/ButtonDemo";

export const DrawHero = (props: { currentYear: number; onDraw: () => void; drawCost: number; canAfford: boolean }) => (
  <GameCard
    className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-y-auto py-10 text-center"
    containerClassName="flex h-full w-full flex-col"
  >
    <GiAnubis size={104} className="text-[#F5B83D]" />
    <p className="max-w-lg font-bold text-lg text-white">Over {fmtNumber(HUMANS_EVER)} people have ever lived.</p>
    <p className="max-w-sm text-sm text-white/60">Anubis weighs every one of them. Read the life right and you are paid; the scales do not care either way.</p>

    <p className="mt-4 font-semibold text-white/80 text-xs uppercase tracking-[0.2em]">Choose one</p>

    {/* <button
      type="button"
      disabled={!props.canAfford}
      onClick={props.onDraw}
      className="cursor-pointer rounded-full bg-[#F5B83D] px-8 py-3 font-bold text-slate-950 hover:bg-[#f0ad24] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Summon a soul
    </button> */}
    <ButtonDemo/>
    <p className="text-white/40 text-xs">Costs {props.drawCost} deben</p>
    {!props.canAfford && <p className="text-[#B7410E] text-xs">Not enough chips</p>}

    <p className="mt-4 max-w-sm text-[#b0aeb5] text-xs leading-[1.5]">
      The Duat gives up a soul in stages: an age, a land, then the life itself — each drawn at random from real data.
    </p>
  </GameCard>
);
