"use client";

import { useState } from "react";
import { GameCenterPlaceholder } from "@/components/game/home/GameCenterPlaceholder";
import { GameHeader } from "@/components/game/home/GameHeader";
import { GameSidebarLeft } from "@/components/game/home/GameSidebarLeft";
import { GameSidebarRight } from "@/components/game/home/GameSidebarRight";
import type { GameMode, RecentWin } from "@/components/game/home/types";

const RECENT_WINS: RecentWin[] = [
  { icon: "🍔", name: "FAST FOOD", multiplier: 1.85, amount: 18.5, currency: "USDC" },
  { icon: "🐻", name: "HONEY BEAR", multiplier: 2.4, amount: 24, currency: "USDC" },
  { icon: "🌻", name: "SUNFLOWER", multiplier: 1.6, amount: 16, currency: "USDC" },
  { icon: "🍦", name: "ICE CREAM", multiplier: 2.1, amount: 21, currency: "USDC" },
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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <GameHeader
        activeMode={activeMode}
        blitzTimeLabel="03:00"
        onSelectMode={setActiveMode}
        balance={32.5}
        currency="USDC"
        avatarLabel="🧑"
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
          recentWins={RECENT_WINS}
        />
      </div>
    </div>
  );
};
