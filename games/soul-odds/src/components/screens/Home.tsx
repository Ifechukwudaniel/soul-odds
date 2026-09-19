"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { MortalOddsStage } from "@/components/game/mortal-odds/MortalOddsStage";
import { useMortalOddsBets } from "@/hooks/useMortalOddsBets";
import { useMortalOddsDraw } from "@/hooks/useMortalOddsDraw";
import type { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { CHIP_SIZES, REDRAW_COST } from "@/lib/mortal-odds/config";
import type { RoundCharge } from "@/types";

const CURRENCY = "deben";

export const HomeScreen = (props: { player: ReturnType<typeof useMortalOddsPlayer> }) => {
  const [chipSize, setChipSize] = useState(10);
  const [charges, setCharges] = useState<RoundCharge[]>([]);

  const reducedMotion = useReducedMotion() ?? false;
  const round = useMortalOddsDraw({ reducedMotion });
  const slip = useMortalOddsBets();
  const { player } = props;

  // Chip size is the round's whole stake: locked the moment a soul is summoned, freed up again once it's revealed.
  const chipLocked = round.phase !== "idle" && round.phase !== "revealed";
  const isRedraw = round.phase === "when" || round.phase === "where";
  const drawCost = isRedraw ? REDRAW_COST : chipSize;

  const onDraw = () => {
    if (!player.spend(drawCost)) {
      return;
    }
    if (isRedraw) {
      setCharges([...charges, { id: `redraw-${charges.length}`, label: "Redraw", amount: REDRAW_COST, kind: "fee" }]);
    } else {
      setCharges([{ id: "stake", label: "Stake", amount: chipSize, kind: "stake" }]);
    }
    slip.reset();
    round.drawHuman();
  };

  const onRevealLocation = () => {
    round.advance();
  };

  const onPlaceBet = () => {
    const result = round.placeBets(slip.bets);
    if (result) player.commitRound(result);
    slip.reset();
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="container mx-auto flex flex-1 flex-col gap-4 px-4 pb-[10dvh] lg:flex-row">
        <MortalOddsStage
          round={round}
          bets={slip.bets}
          chipSize={chipSize}
          currency={CURRENCY}
          onDraw={onDraw}
          onSetChoice={slip.setChoice}
          onPlaceBet={onPlaceBet}
          onRevealLocation={onRevealLocation}
          drawCost={drawCost}
          canAffordDraw={player.canAfford(drawCost)}
          charges={charges}
          quickAmounts={CHIP_SIZES}
          onSelectChip={setChipSize}
          chipLocked={chipLocked}
          prices={round.prices}
          priceDeathYear={round.priceDeathYear}
          onRemoveBet={slip.remove}
        />
      </div>
    </div>
  );
};
