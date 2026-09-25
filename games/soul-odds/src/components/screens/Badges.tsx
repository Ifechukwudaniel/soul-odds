import { ChevronLeftIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { useAppStore } from '@/services/store/store';
import { DolphinBadge } from '../assets/badges/DolphinBadge';
import { KrakenBadge } from '../assets/badges/KrakenBadge';
import { LeviathanBadge } from '../assets/badges/LeviathanBadge';
import { MegalodonBadge } from '../assets/badges/MegalodonBadge';
import { MinnowBadge } from '../assets/badges/MinnowBadge';
import { OrcaBadge } from '../assets/badges/OrcaBadge';
import { PlanktonBadge } from '../assets/badges/PlanktonBadge';
import { SharkBadge } from '../assets/badges/SharkBadge';
import { WhaleBadge } from '../assets/badges/WhaleBadge';
import { BadgeCard } from '../soulodds/BadgeCard';

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
    title: 'Plankton',
    requiredCoin: 30000,
    isUnlocked: true,
    claimed: true,
    reward: 3000,
    unlockedIcon: <PlanktonBadge unlocked />,
    lockedIcon: <PlanktonBadge unlocked={true} />,
  },
  {
    title: 'Minnow',
    requiredCoin: 60000,
    reward: 6000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <MinnowBadge unlocked />,
    lockedIcon: <MinnowBadge unlocked={false} />,
  },
  {
    title: 'Dolphin',
    requiredCoin: 120000,
    reward: 12000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <DolphinBadge unlocked />,
    lockedIcon: <DolphinBadge unlocked={false} />,
  },
  {
    title: 'Shark',
    requiredCoin: 240000,
    reward: 24000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <SharkBadge unlocked />,
    lockedIcon: <SharkBadge unlocked={false} />,
  },
  {
    title: 'Orca',
    requiredCoin: 480000,
    reward: 48000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <OrcaBadge unlocked />,
    lockedIcon: <OrcaBadge unlocked={false} />,
  },
  {
    title: 'Whale',
    requiredCoin: 960000,
    reward: 96000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <WhaleBadge unlocked />,
    lockedIcon: <WhaleBadge unlocked={false} />,
  },
  {
    title: 'Megalodon',
    requiredCoin: 1920000,
    reward: 192000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <MegalodonBadge unlocked />,
    lockedIcon: <MegalodonBadge unlocked={false} />,
  },
  {
    title: 'Leviathan',
    requiredCoin: 3840000,
    reward: 384000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <LeviathanBadge unlocked />,
    lockedIcon: <LeviathanBadge unlocked={false} />,
  },
  {
    title: 'Kraken',
    requiredCoin: 7680000,
    reward: 768000,
    claimed: false,
    isUnlocked: false,
    unlockedIcon: <KrakenBadge unlocked />,
    lockedIcon: <KrakenBadge unlocked={false} />,
  },
];

export const BadgesScreen = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const user = useAppStore((state) => state.user);
  const balance = useAppStore((state) => state.user.balance);
  const claimRank = useAppStore((state) => state.claimRank);
  const updateBalance = useAppStore((state) => state.updateBalance);
  const badgeUserData = badgesLists.map((badge, index) => {
    const isUnlocked = user.skill >= badge.requiredCoin;
    const hasNotClaimed = !(index <= user.rank) && isUnlocked;
    return { ...badge, isUnlocked, claimed: hasNotClaimed };
  });

  const goBack = () => {
    setScreen('home');
  };

  const handleClaim = (id: number, reward: number) => {
    claimRank(id);
    updateBalance(balance + reward);
  };

  return (
    <section className="overflow-y flex h-screen flex-col max-md:h-auto">
      <div className="container mx-auto my-8 px-4 pb-32 max-md:my-4 max-md:pb-4">
        <div className="fixed top-0 right-0 left-0 z-40 container mb-5 flex h-20 p-5 max-md:static max-md:mb-3 max-md:h-auto max-md:p-0">
          <button onClick={goBack} className="rounded-lg bg-[#293641] p-3 hover:bg-[#182027]">
            <ChevronLeftIcon width={20} />
          </button>
        </div>
        <div className="mt-10 max-md:mt-2">
          <h2 className="mb-3 text-2xl font-[500] max-md:text-xl">Ranks</h2>
          <p className="sf-pro-medium text-sm leading-[1.7] max-md:text-[0.8rem] max-md:leading-[1.5] max-md:text-white/70">
            Consistently show up, climb up the ladder and unlock all the ranks! Your skill points
            determine the rank you are in.
          </p>
          <div className="mt-8">
            <div className="my-6 grid grid-cols-3 gap-x-1 gap-y-10 max-md:gap-y-6">
              {badgeUserData.map(
                (
                  { title, reward, unlockedIcon, lockedIcon, isUnlocked, requiredCoin, claimed },
                  index,
                ) => (
                  <BadgeCard
                    title={title}
                    unlockedIcon={unlockedIcon}
                    lockedIcon={lockedIcon}
                    isUnlocked={isUnlocked}
                    tokenMinned={user.skill}
                    key={title}
                    reward={reward}
                    requiredCoin={requiredCoin}
                    claimed={claimed}
                    onClaim={() => handleClaim(index, reward)}
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
