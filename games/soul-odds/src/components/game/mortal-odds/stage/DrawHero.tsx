import { GiAnubis } from 'react-icons/gi';
import { ButtonDemo } from '@/components/assets/ButtonDemo';
import { GameCard } from '@/components/game/home/GameCard';
import { HUMANS_EVER } from '@/lib/mortal-odds/config';
import { fmtNumber } from '@/lib/mortal-odds/format';

export const DrawHero = (props: {
  currentYear: number;
  onDraw: () => void;
  drawCost: number;
  canAfford: boolean;
}) => (
  <GameCard
    scrollable
    className="flex flex-col items-center justify-center gap-3 py-10 text-center"
    containerClassName="flex h-full w-full flex-col"
  >
    <GiAnubis size={104} className="text-[#F5B83D]" />
    <p className="max-w-lg text-lg font-bold text-white">
      Over {fmtNumber(HUMANS_EVER)} people have ever lived.
    </p>
    <p className="max-w-sm text-sm text-white/60">
      Anubis weighs every one of them. Read the life right and you are paid; the scales do not care
      either way.
    </p>

    <p className="mt-4 text-xs font-semibold tracking-[0.2em] text-white/80 uppercase">
      Choose one
    </p>

    {/* <button
      type="button"
      disabled={!props.canAfford}
      onClick={props.onDraw}
      className="cursor-pointer rounded-full bg-[#F5B83D] px-8 py-3 font-bold text-slate-950 hover:bg-[#f0ad24] disabled:cursor-not-allowed disabled:opacity-40"
    >
      Summon a soul
    </button> */}
    <button
      type="button"
      disabled={!props.canAfford}
      onClick={props.onDraw}
      aria-label="Summon a soul"
      className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
    >
      <ButtonDemo />
    </button>
    <p className="text-xs text-white/40">Locks in a {props.drawCost} deben stake for this soul</p>
    {!props.canAfford && <p className="text-xs text-[#B7410E]">Not enough chips</p>}

    <p className="mt-4 max-w-sm text-xs leading-[1.5] text-[#b0aeb5]">
      The Duat gives up a soul in stages: an age, a land, then the life itself — each drawn at
      random from real data.
    </p>
  </GameCard>
);
