"use client";

import { GameCard } from "@/components/game/home/GameCard";
import { StageSlide } from "@/components/game/mortal-odds/stage/StageSlide";
import { StageStepper } from "@/components/game/mortal-odds/stage/draw/StageStepper";
import { WhenSlide } from "@/components/game/mortal-odds/stage/draw/WhenSlide";
import { WhereSlide } from "@/components/game/mortal-odds/stage/draw/WhereSlide";
import { playClickSound } from "@/utils/playClickSound";
import type { Draw, PlaceContext } from "@/types";

const STEPS = ["when", "where"] as const;


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
  const activeIndex = STEPS.indexOf(props.step);
  const isWhere = props.step === "where";

  return (
    <GameCard
      className="flex min-h-0 flex-1 flex-col gap-3"
      containerClassName="flex h-full w-full flex-col"
    >
      <StageStepper steps={STEPS} activeIndex={activeIndex} />

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
          className="rounded-lg border border-white/15 px-4 py-3 font-semibold text-sm text-white/70 hover:text-white disabled:opacity-30"
        >
          {isWhere ? "← Back" : `Redraw · ${props.drawCost}`}
        </button>

        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            disabled={props.isSpinning || (!isWhere && !props.canAffordLocation)}
            onClick={() => {
              playClickSound();
              props.onAdvance();
            }}
            className="chamfer-btn chamfer-btn-glow flex items-center gap-3 px-8 py-3 font-bold text-base text-white disabled:opacity-40"
          >
            <span className="tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">
              {isWhere ? "Make your predictions" : `Reveal location · ${props.locationCost}`}
            </span>
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]">→</span>
          </button>
          {!isWhere && !props.canAffordLocation && <p className="text-[#F87171] text-xs">Not enough chips</p>}
        </div>
      </div>
    </GameCard>
  );
};
