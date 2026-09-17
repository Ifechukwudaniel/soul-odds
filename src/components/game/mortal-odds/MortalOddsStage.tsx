"use client";

import { MotionConfig } from "framer-motion";
import { DrawHero } from "@/components/game/mortal-odds/stage/DrawHero";
import { EraFilter } from "@/components/game/mortal-odds/stage/EraFilter";
import { MarketPager } from "@/components/game/mortal-odds/stage/markets/MarketPager";
import type { MortalOddsBets } from "@/hooks/useMortalOddsBets";
import type { MortalOddsRound } from "@/hooks/useMortalOddsDraw";

export const MortalOddsStage = (props: {
  round: MortalOddsRound;
  bets: MortalOddsBets["bets"];
  chipSize: number;
  onDraw: () => void;
  onSetChoice: MortalOddsBets["setChoice"];
  onSetDeathYear: MortalOddsBets["setDeathYear"];
  onRemoveBet: MortalOddsBets["remove"];
}) => {
  const { round } = props;

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex w-full flex-1 flex-col gap-3" aria-live="polite">
        <EraFilter activeEra={round.era} disabled={round.phase === "drawing"} onSelect={round.setEra} />

        <DrawHero
          phase={round.phase}
          draw={round.draw}
          context={round.context}
          displayYear={round.displayYear}
          currentYear={round.currentYear}
          onDraw={props.onDraw}
        />

        {round.phase === "drawn" && round.draw && round.prices && round.defaultDeathGuess !== null && (
          <MarketPager
            draw={round.draw}
            prices={round.prices}
            priceDeathYear={round.priceDeathYear}
            defaultDeathGuess={round.defaultDeathGuess}
            chipSize={props.chipSize}
            bets={props.bets}
            onSetChoice={props.onSetChoice}
            onSetDeathYear={props.onSetDeathYear}
            onRemoveBet={props.onRemoveBet}
            key={`${round.draw.year}-${round.draw.region}-${round.draw.place.name}`}
          />
        )}
      </div>
    </MotionConfig>
  );
};
