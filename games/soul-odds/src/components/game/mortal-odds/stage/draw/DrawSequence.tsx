"use client";

import { GameButton } from "@/components/game/GameButton";
import { GameCard } from "@/components/game/home/GameCard";
import { StageSlide } from "@/components/game/mortal-odds/stage/StageSlide";
import { StageStepper } from "@/components/game/mortal-odds/stage/draw/StageStepper";
import { WhenSlide } from "@/components/game/mortal-odds/stage/draw/WhenSlide";
import { WhereSlide } from "@/components/game/mortal-odds/stage/draw/WhereSlide";
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
  canAffordDraw: boolean;
}) => {
  const activeIndex = STEPS.findIndex((entry) => entry.key === props.step);
  const isWhere = props.step === "where";

  return (
    <GameCard
      className="flex min-h-0 flex-1 flex-col gap-3"
      containerClassName="flex h-full w-full flex-col"
    >
      <StageStepper steps={STEPS.map((entry) => entry.label)} activeIndex={activeIndex} />

      <StageSlide slideKey={props.step} direction={isWhere ? 1 : -1} reserveGutter>
        {isWhere ? (
          <WhereSlide year={props.draw.year} place={props.draw.place} local={props.context.local} />
        ) : (
          <WhenSlide
            year={props.draw.year}
            displayYear={props.displayYear}
            isSpinning={props.isSpinning}
            story={props.context.story}
            currentYear={props.currentYear}
          />
        )}
      </StageSlide>

      <div className="flex items-center justify-between gap-3">
        <GameButton
          variant="secondary"
          silent={!isWhere}
          disabled={props.isSpinning || (!isWhere && !props.canAffordDraw)}
          onClick={() => {
            if (isWhere) {
              props.onRetreat();
            } else {
              props.onRedraw();
            }
          }}
          className="group px-5 py-2.5 text-sm"
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
                <CurrencyCoinIcon width={16} height="16" />
                {props.drawCost}
              </span>
            </>
          )}
        </GameButton>

        <div className="flex flex-col items-end gap-1">
          <GameButton variant="papyrus" disabled={props.isSpinning} onClick={props.onAdvance} className="group px-5 py-2.5 text-sm">
            {isWhere ? "Weigh their fate" : "Reveal the land"}
            <PiArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </GameButton>
        </div>
      </div>
    </GameCard>
  );
};
