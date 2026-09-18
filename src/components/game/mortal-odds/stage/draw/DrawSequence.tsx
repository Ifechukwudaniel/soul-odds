"use client";

import { GameCard } from "@/components/game/home/GameCard";
import { StageSlide } from "@/components/game/mortal-odds/stage/StageSlide";
import { StageStepper } from "@/components/game/mortal-odds/stage/draw/StageStepper";
import { WhenSlide } from "@/components/game/mortal-odds/stage/draw/WhenSlide";
import { WhereSlide } from "@/components/game/mortal-odds/stage/draw/WhereSlide";
import { playClickSound } from "@/utils/playClickSound";
import { PiArrowLeft, PiArrowsClockwise } from "react-icons/pi";
import { PiArrowRight } from "react-icons/pi";

import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";

import type { Draw, PlaceContext } from "@/types";

const STEPS = [
  { key: "when", label: "the age" },
  { key: "where", label: "the land" },
] as const;


export const DrawSequence = (props: {
  draw: Draw;
  context: PlaceContext;
  displayYear: number | null;
  isSpinning: boolean;
  currentYear: number;
  step: "when" | "where";
  onAdvance: () => void;
  onRetreat: () => void;
  onRedraw: () => void;
  drawCost: number;
  locationCost: number;
  canAffordDraw: boolean;
  canAffordLocation: boolean;
}) => {
  const activeIndex = STEPS.findIndex((entry) => entry.key === props.step);
  const isWhere = props.step === "where";

  return (
    <GameCard
      className="flex min-h-0 flex-1 flex-col gap-3"
      containerClassName="flex h-full w-full flex-col"
    >
      <StageStepper steps={STEPS.map((entry) => entry.label)} activeIndex={activeIndex} />

      <StageSlide slideKey={props.step} direction={isWhere ? 1 : -1}>
        {isWhere ? (
          <WhereSlide year={props.draw.year} place={props.draw.place} local={props.context.local} />
        ) : (
          <WhenSlide
            year={props.draw.year}
            displayYear={props.displayYear}
            isSpinning={props.isSpinning}
            when={props.context.when}
            currentYear={props.currentYear}
          />
        )}
      </StageSlide>

      <div className="flex items-center justify-between gap-3">
      <button
  type="button"
  disabled={props.isSpinning || (!isWhere && !props.canAffordDraw)}
  onClick={() => {
    playClickSound();
    if (isWhere) {
      props.onRetreat();
    } else {
      props.onRedraw();
    }
  }}
  className="cursor-pointer group inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 backdrop-blur-sm transition-all duration-150 hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
>
  {isWhere ? (
    <>
      <PiArrowLeft className="h-4 w-4 transition-transform duration-150 group-hover:-translate-x-0.5" />
      Back
    </>
  ) : (
    <>
      <PiArrowsClockwise className="h-4 w-4 transition-transform duration-150 group-hover:rotate-180" />
      Redraw
      <span className="flex items-center gap-1 text-white/50 group-hover:text-white/80">
        <span className="h-3 w-px bg-white/20" />
        <CurrencyCoinIcon width={16} height="16"/>
        {props.drawCost}
      </span>
    </>
  )}
</button>

        <div className="flex flex-col items-end gap-1">

        <button
  type="button"
  disabled={props.isSpinning || (!isWhere && !props.canAffordLocation)}
  onClick={() => {
    playClickSound();
    props.onAdvance();
  }}
  className="group inline-flex items-center gap-2 rounded-full border-2 border-[#F5B83D] bg-[#F5B83D]/10 px-5 py-2.5 text-sm font-bold text-[#F5B83D] transition-all duration-150 hover:bg-[#F5B83D]/20 active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
>
  {isWhere ? (
    "Weigh their fate"
  ) : (
    <>
      Reveal the land
      <span className="flex items-center gap-1 text-[#F5B83D]/80 group-hover:text-[#F5B83D]">
        <span className="h-3 w-px bg-[#F5B83D]/40" />
        <CurrencyCoinIcon width={16} height="16" />
        {props.locationCost}
      </span>
    </>
  )}
  <PiArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
</button>
          {!isWhere && !props.canAffordLocation && <p className="text-[#B7410E] text-xs">Not enough deben</p>}
        </div>
      </div>
    </GameCard>
  );
};
