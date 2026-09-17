"use client";

import { GameCard } from "@/components/game/home/GameCard";
import { StageSlide } from "@/components/game/mortal-odds/stage/StageSlide";
import { StageStepper } from "@/components/game/mortal-odds/stage/draw/StageStepper";
import { WhenSlide } from "@/components/game/mortal-odds/stage/draw/WhenSlide";
import { WhereSlide } from "@/components/game/mortal-odds/stage/draw/WhereSlide";
import { playClickSound } from "@/utils/playClickSound";
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
          className="rounded-full border border-white/20 px-5 py-2.5 font-semibold text-sm text-white/70 hover:border-white/40 hover:text-white disabled:opacity-30"
        >
          {isWhere ? "← Back" : `↻ Redraw · ${props.drawCost}`}
        </button>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={props.isSpinning || (!isWhere && !props.canAffordLocation)}
            onClick={() => {
              playClickSound();
              props.onAdvance();
            }}
            className="rounded-full border-2 border-[#F5B83D] px-6 py-2.5 font-bold text-[#F5B83D] hover:bg-[#F5B83D]/10 disabled:opacity-40"
          >
            {isWhere ? "Weigh their fate" : `Reveal the land · ${props.locationCost}`} →
          </button>
          {!isWhere && !props.canAffordLocation && <p className="text-[#B7410E] text-xs">Not enough deben</p>}
        </div>
      </div>
    </GameCard>
  );
};
