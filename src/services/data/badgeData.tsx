import React from "react";
import { DolphinBadge } from "@/components/assets/badges/DolphinBadge";
import { KrakenBadge } from "@/components/assets/badges/KrakenBadge";
import { LeviathanBadge } from "@/components/assets/badges/LeviathanBadge";
import { MegalodonBadge } from "@/components/assets/badges/MegalodonBadge";
import { MinnowBadge } from "@/components/assets/badges/MinnowBadge";
import { OrcaBadge } from "@/components/assets/badges/OrcaBadge";
import { PlanktonBadge } from "@/components/assets/badges/PlanktonBadge";
import { SharkBadge } from "@/components/assets/badges/SharkBadge";
import { WhaleBadge } from "@/components/assets/badges/WhaleBadge";

export type BadgesList = {
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
