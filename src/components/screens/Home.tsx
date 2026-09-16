"use client";

import { useState } from "react";
import { Slime } from "@/components/assets/characters/Slime";
import { GameCenterPlaceholder } from "@/components/game/home/GameCenterPlaceholder";
import { GameHeader } from "@/components/game/home/GameHeader";
import { GameSidebarLeft } from "@/components/game/home/GameSidebarLeft";
import { GameSidebarRight } from "@/components/game/home/GameSidebarRight";
import { ProfileModal } from "@/components/game/home/profile/ProfileModal";
import type { GameMode, LeaderboardEntry } from "@/components/game/home/types";
import { useAppStore } from "@/services/store/store";

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "ceeriil", score: 18500 },
  { rank: 2, name: "devdanhiel", score: 15200 },
  { rank: 3, name: "SUNFLOWER", score: 12800 },
  { rank: 4, name: "ICE_CREAM99", score: 9100 },
];

const HOW_IT_WORKS_STEPS = [
  "Solve the visual puzzle",
  "Get your reward in USDC",
  "Cash out or risk it all",
];

const QUICK_BET_AMOUNTS = [1, 5, 10, 25, 50];

export const HomeScreen = () => {
  const [activeMode, setActiveMode] = useState<GameMode>("survival");
  const [betAmount, setBetAmount] = useState(10);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <GameHeader
        activeMode={activeMode}
        blitzTimeLabel="03:00"
        onSelectMode={setActiveMode}
        balance={32.5}
        currency="USDC"
        avatar={<Slime width={24} height="24" />}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      <div className="flex flex-1 flex-col gap-4 px-6 pb-6 lg:flex-row">
        <GameSidebarLeft
          modeTitle="Survival Mode"
          modeDescription="Solve puzzles, manage your hearts, and cash out or risk for a bigger reward."
          lives={3}
          maxLives={4}
          currentStreak={3}
          maxWin="$12.40"
          howItWorksSteps={HOW_IT_WORKS_STEPS}
        />

        <GameCenterPlaceholder />

        <GameSidebarRight
          currency="USDC"
          betAmount={betAmount}
          minAmount={1}
          maxAmount={50}
          quickAmounts={QUICK_BET_AMOUNTS}
          potentialWinMultiplier={1.85}
          onSelectAmount={setBetAmount}
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
