"use client";

import { useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Slime } from "@/components/assets/characters/Slime";
import { GameHeader } from "@/components/game/home/GameHeader";
import { GameSidebarRight } from "@/components/game/home/GameSidebarRight";
import { ProfileModal } from "@/components/game/home/profile/ProfileModal";
import type { GameMode, LeaderboardEntry } from "@/components/game/home/types";
import { MortalOddsStage } from "@/components/game/mortal-odds/MortalOddsStage";
import { useMortalOddsBets } from "@/hooks/useMortalOddsBets";
import { useMortalOddsDraw } from "@/hooks/useMortalOddsDraw";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { useAppStore } from "@/services/store/store";

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "ceeriil", score: 18500 },
  { rank: 2, name: "devdanhiel", score: 15200 },
  { rank: 3, name: "SUNFLOWER", score: 12800 },
  { rank: 4, name: "ICE_CREAM99", score: 9100 },
];

const CHIP_SIZES = [1, 5, 10, 25, 50];
const CURRENCY = "chips";

export const HomeScreen = () => {
  const [activeMode, setActiveMode] = useState<GameMode>("survival");
  const [chipSize, setChipSize] = useState(10);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const setScreen = useAppStore((state) => state.setScreen);

  const reducedMotion = useReducedMotion() ?? false;
  const round = useMortalOddsDraw({ reducedMotion });
  const slip = useMortalOddsBets();
  const player = useMortalOddsPlayer();

  const onDraw = () => {
    slip.reset();
    round.drawHuman();
  };

  const onPlaceBet = () => {
    const result = round.placeBets(slip.bets);
    if (result) player.commitRound(result);
    slip.reset();
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <GameHeader
        activeMode={activeMode}
        blitzTimeLabel="03:00"
        onSelectMode={setActiveMode}
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
          onSetDeathYear={slip.setDeathYear}
          onRemoveBet={slip.remove}
        />

        <GameSidebarRight
          currency={CURRENCY}
          chipSize={chipSize}
          quickAmounts={CHIP_SIZES}
          onSelectChip={setChipSize}
          bets={slip.bets}
          prices={round.prices}
          priceDeathYear={round.priceDeathYear}
          onRemoveBet={slip.remove}
          onPlaceBet={onPlaceBet}
          canPlaceBet={round.phase === "drawn"}
          leaderboard={LEADERBOARD}
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
