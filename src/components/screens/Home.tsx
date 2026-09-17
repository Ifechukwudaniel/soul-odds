"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Slime } from "@/components/assets/characters/Slime";
import { GameHeader } from "@/components/game/home/GameHeader";
import { ProfileModal } from "@/components/game/home/profile/ProfileModal";
import { MortalOddsStage } from "@/components/game/mortal-odds/MortalOddsStage";
import { useMortalOddsBets } from "@/hooks/useMortalOddsBets";
import { useMortalOddsDraw } from "@/hooks/useMortalOddsDraw";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { STEP_COSTS } from "@/lib/mortal-odds/config";
import type { RoundCharge } from "@/types";
import { useAppStore } from "@/services/store/store";

const CHIP_SIZES = [1, 5, 10, 25, 50];
const CURRENCY = "chips";

export const HomeScreen = () => {
  const [chipSize, setChipSize] = useState(10);
  const [charges, setCharges] = useState<RoundCharge[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const setScreen = useAppStore((state) => state.setScreen);

  const reducedMotion = useReducedMotion() ?? false;
  const round = useMortalOddsDraw({ reducedMotion });
  const slip = useMortalOddsBets();
  const player = useMortalOddsPlayer();

  const isRedraw = round.phase === "when" || round.phase === "where";
  const drawCost = isRedraw ? STEP_COSTS.redraw : STEP_COSTS.draw;

  const onDraw = () => {
    if (!player.spend(drawCost)) {
      return;
    }
    const charge = { id: `draw-${charges.length}`, label: isRedraw ? "Redraw" : "Draw", amount: drawCost };
    setCharges(isRedraw ? [...charges, charge] : [charge]);
    slip.reset();
    round.drawHuman();
  };

  const onRevealLocation = () => {
    if (!player.spend(STEP_COSTS.location)) {
      return;
    }
    setCharges([...charges, { id: `location-${charges.length}`, label: "Location", amount: STEP_COSTS.location }]);
    round.advance();
  };

  const onPlaceBet = () => {
    const result = round.placeBets(slip.bets);
    if (result) player.commitRound(result);
    slip.reset();
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <GameHeader
        balance={player.stats.bankroll}
        currency={CURRENCY}
        avatar={<Slime width={24} height="24" />}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="flex flex-1 flex-col gap-4 px-6 pb-28 lg:flex-row">
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
          locationCost={STEP_COSTS.location}
          canAffordDraw={player.canAfford(drawCost)}
          canAffordLocation={player.canAfford(STEP_COSTS.location)}
          charges={charges}
          quickAmounts={CHIP_SIZES}
          onSelectChip={setChipSize}
          prices={round.prices}
          priceDeathYear={round.priceDeathYear}
          onRemoveBet={slip.remove}
        />
      </div>

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        username="ceeriil"
        handle="ceeriil"
        rank="Silver"
        leaderboardRank={42881}
        onViewRankPage={() => setScreen("badges")}
      />
    </div>
  );
};
