import React, { useEffect, useState } from "react";
import { AutoSwipeIcon } from "../assets/AutoSwipeIcon";
import { DolphinBadge } from "../assets/badges/DolphinBadge";
import { KrakenBadge } from "../assets/badges/KrakenBadge";
import { LeviathanBadge } from "../assets/badges/LeviathanBadge";
import { MegalodonBadge } from "../assets/badges/MegalodonBadge";
import { MinnowBadge } from "../assets/badges/MinnowBadge";
import { OrcaBadge } from "../assets/badges/OrcaBadge";
import { PlanktonBadge } from "../assets/badges/PlanktonBadge";
import { SharkBadge } from "../assets/badges/SharkBadge";
import { WhaleBadge } from "../assets/badges/WhaleBadge";
import { BadgeCard } from "../touchswap/BadgeCard";
import { BoostCard } from "../touchswap/BoostCard";
import { useAppStore } from "@/services/store/store";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

type BadgesList = {
  title: string;
  reward: number;
  claimed: boolean;
  requiredCoin: number;
  icon?: React.ReactNode;
  isUnlocked: boolean;
  unlockedIcon?: React.ReactNode;
  lockedIcon?: React.ReactNode;
};

export const badgesLists: BadgesList[] = [
  {
    title: "Plankton",
    requiredCoin: 30000,
    isUnlocked: true,
    claimed: true,
    reward: 3000,
    unlockedIcon: <PlanktonBadge unlocked />,
    lockedIcon: <PlanktonBadge unlocked={true} />,
  },
  {
    title: "Minnow",
    requiredCoin: 60000,
    reward: 6000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <MinnowBadge unlocked />,
    lockedIcon: <MinnowBadge unlocked={false} />,
  },
  {
    title: "Dolphin",
    requiredCoin: 120000,
    reward: 12000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <DolphinBadge unlocked />,
    lockedIcon: <DolphinBadge unlocked={false} />,
  },
  {
    title: "Shark",
    requiredCoin: 240000,
    reward: 24000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <SharkBadge unlocked />,
    lockedIcon: <SharkBadge unlocked={false} />,
  },
  {
    title: "Orca",
    requiredCoin: 480000,
    reward: 48000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <OrcaBadge unlocked />,
    lockedIcon: <OrcaBadge unlocked={false} />,
  },
  {
    title: "Whale",
    requiredCoin: 960000,
    reward: 96000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <WhaleBadge unlocked />,
    lockedIcon: <WhaleBadge unlocked={false} />,
  },
  {
    title: "Megalodon",
    requiredCoin: 1920000,
    reward: 192000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <MegalodonBadge unlocked />,
    lockedIcon: <MegalodonBadge unlocked={false} />,
  },
  {
    title: "Leviathan",
    requiredCoin: 3840000,
    reward: 384000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <LeviathanBadge unlocked />,
    lockedIcon: <LeviathanBadge unlocked={false} />,
  },
  {
    title: "Kraken",
    requiredCoin: 7680000,
    reward: 768000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <KrakenBadge unlocked />,
    lockedIcon: <KrakenBadge unlocked={false} />,
  },
];

export const BadgesScreen = () => {
  const totalCoinsMined = useAppStore(state => state.user!.totalCoinsMined);
  const setScreen = useAppStore(state => state.setScreen);
  const user = useAppStore(state => state.user);
  const balance = useAppStore(state => state.user.balance);
  const cliamRank = useAppStore(state => state.cliamRank);
  const updateBalance = useAppStore(state => state.updateBalance);
  const badgeUserData = badgesLists.map((badge, index) => {
    const isUnlocked = user.totalCoinsMined >= badge.requiredCoin;
    const hasNotClaimed = !(index <= user.rank) && isUnlocked;
    return { ...badge, isUnlocked, claimed: hasNotClaimed };
  });

  /*   const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);
   */
  /*  useEffect(() => {
    if (typeof window !== "undefined" && !isSSR()) {
      setHapticFeedback(initHapticFeedback());
    }
  }, []); */

  const goBack = () => {
    setScreen("home");
  };

  const handleClaim = (id: number, reward: number) => {
    cliamRank(id);
    updateBalance(balance + reward);
  };

  return (
    <section className="flex flex-col h-screen overflow-y">
      <div className="container mx-auto px-4 my-8 pb-32">
        <div className="flex container h-20  mb-5   fixed top-0 left-0 right-0 p-5 z-40">
          <button onClick={goBack} className="p-3 hover:bg-[#182027] bg-[#293641] rounded-lg ">
            <ChevronLeftIcon width={20} />
          </button>
        </div>
        <div className="mt-10">
          <h2 className="text-2xl font-[500] mb-3">Ranks</h2>
          <p className="text-sm leading-[1.7] sf-pro-medium">
            Consistently show up, climb up the ladder and unlock all the ranks! Your number of coins determine the rank
            you are in.
          </p>
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-x-1 gap-y-10 my-6">
              {badgeUserData.map(
                ({ title, reward, unlockedIcon, lockedIcon, isUnlocked, requiredCoin, claimed }, index) => (
                  <BadgeCard
                    title={title}
                    unlockedIcon={unlockedIcon}
                    lockedIcon={lockedIcon}
                    isUnlocked={isUnlocked}
                    tokenMinned={totalCoinsMined}
                    key={title}
                    reward={reward}
                    requiredCoin={requiredCoin}
                    cliamed={claimed}
                    onCliam={() => handleClaim(index, reward)}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
