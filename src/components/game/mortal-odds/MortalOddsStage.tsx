"use client";

import { MotionConfig } from "framer-motion";
import { DrawHero } from "@/components/game/mortal-odds/stage/DrawHero";
import { PredictionsPanel } from "@/components/game/mortal-odds/stage/markets/PredictionsPanel";
import { RevealPanel } from "@/components/game/mortal-odds/stage/reveal/RevealPanel";
import type { MortalOddsBets } from "@/hooks/useMortalOddsBets";
import type { MortalOddsRound } from "@/hooks/useMortalOddsDraw";

export const MortalOddsStage = (props: {
  round: MortalOddsRound;
  bets: MortalOddsBets["bets"];
  chipSize: number;
  currency: string;
  onDraw: () => void;
  onSetChoice: MortalOddsBets["setChoice"];
  onPlaceBet: () => void;
}) => {
  const { round } = props;
  const isPredicting = round.phase === "predicting";

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex w-full flex-1 flex-col gap-3" aria-live="polite">
        {isPredicting && round.draw && round.prices ? (
          <PredictionsPanel
            prices={round.prices}
            chipSize={props.chipSize}
            bets={props.bets}
            onSetChoice={props.onSetChoice}
            onBack={round.closePredictions}
            onPlaceBet={props.onPlaceBet}
            key={`${round.draw.year}-${round.draw.region}-${round.draw.place.name}`}
          />
        ) : (
          <>
            <DrawHero
              phase={round.phase}
              draw={round.draw}
              context={round.context}
              displayYear={round.displayYear}
              currentYear={round.currentYear}
              onDraw={props.onDraw}
              onContinue={round.openPredictions}
            />

            {round.phase === "revealed" && round.reveal && round.draw && (
              <RevealPanel reveal={round.reveal} place={round.draw.place} currentYear={round.currentYear} currency={props.currency} onNext={props.onDraw} />
            )}
          </>
        )}
      </div>
    </MotionConfig>
  );
};
