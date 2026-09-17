"use client";

import { MotionConfig } from "framer-motion";
import { BetPanel } from "@/components/game/home/BetPanel";
import { DrawHero } from "@/components/game/mortal-odds/stage/DrawHero";
import { DrawSequence } from "@/components/game/mortal-odds/stage/draw/DrawSequence";
import { PredictionsPanel } from "@/components/game/mortal-odds/stage/markets/PredictionsPanel";
import { RevealPanel } from "@/components/game/mortal-odds/stage/reveal/RevealPanel";
import { BetSummary } from "@/components/game/mortal-odds/stage/summary/BetSummary";
import type { MortalOddsBets } from "@/hooks/useMortalOddsBets";
import type { MortalOddsRound } from "@/hooks/useMortalOddsDraw";
import { marketsConfig } from "@/lib/mortal-odds/config";
import type { MarketPrices, Price, RoundCharge } from "@/types";

export const MortalOddsStage = (props: {
  round: MortalOddsRound;
  bets: MortalOddsBets["bets"];
  chipSize: number;
  currency: string;
  onDraw: () => void;
  onSetChoice: MortalOddsBets["setChoice"];
  onPlaceBet: () => void;
  onRevealLocation: () => void;
  drawCost: number;
  locationCost: number;
  canAffordDraw: boolean;
  canAffordLocation: boolean;
  charges: RoundCharge[];
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  onRemoveBet: MortalOddsBets["remove"];
}) => {
  const { round } = props;
  const inDrawSequence = round.phase === "drawing" || round.phase === "when" || round.phase === "where";

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex w-full flex-1 flex-col gap-4 lg:h-[min(calc(100dvh-14rem),44rem)] lg:flex-row"
        aria-live="polite"
      >
        <div className="order-last shrink-0 lg:order-first lg:h-full lg:w-80">
          <BetPanel
            currency={props.currency}
            chipSize={props.chipSize}
            quickAmounts={props.quickAmounts}
            onSelectChip={props.onSelectChip}
            bets={props.bets}
            prices={props.prices}
            priceDeathYear={props.priceDeathYear}
            onRemoveBet={props.onRemoveBet}
            charges={props.charges}
            onPlaceBet={round.advance}
            canPlaceBet={round.phase === "predicting"}
            isLocked={round.phase === "confirming"}
            requiredBets={marketsConfig.length}
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col lg:h-full">
          {round.phase === "idle" && (
            <DrawHero
              currentYear={round.currentYear}
              onDraw={props.onDraw}
              drawCost={props.drawCost}
              canAfford={props.canAffordDraw}
            />
          )}

          {inDrawSequence && round.draw && round.context && (
            <DrawSequence
              draw={round.draw}
              context={round.context}
              displayYear={round.displayYear}
              isSpinning={round.phase === "drawing"}
              currentYear={round.currentYear}
              step={round.phase === "where" ? "where" : "when"}
              onAdvance={round.phase === "when" ? props.onRevealLocation : round.advance}
              onRetreat={round.retreat}
              onRedraw={props.onDraw}
              drawCost={props.drawCost}
              locationCost={props.locationCost}
              canAffordDraw={props.canAffordDraw}
              canAffordLocation={props.canAffordLocation}
            />
          )}

          {round.phase === "predicting" && round.draw && round.prices && (
            <PredictionsPanel
              prices={round.prices}
              chipSize={props.chipSize}
              bets={props.bets}
              onSetChoice={props.onSetChoice}
              onBack={round.retreat}
              key={`${round.draw.year}-${round.draw.region}-${round.draw.place.name}`}
            />
          )}

          {round.phase === "confirming" && round.draw && round.prices && (
            <BetSummary
              draw={round.draw}
              bets={props.bets}
              prices={round.prices}
              priceDeathYear={round.priceDeathYear}
              charges={props.charges}
              currency={props.currency}
              onBack={round.retreat}
              onConfirm={props.onPlaceBet}
            />
          )}

          {round.phase === "revealed" && round.reveal && round.draw && (
            <RevealPanel
              reveal={round.reveal}
              place={round.draw.place}
              currentYear={round.currentYear}
              currency={props.currency}
              charges={props.charges}
              onNext={props.onDraw}
              drawCost={props.drawCost}
              canAffordDraw={props.canAffordDraw}
            />
          )}
        </div>
      </div>
    </MotionConfig>
  );
};
