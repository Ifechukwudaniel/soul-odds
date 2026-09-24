import Image from 'next/image';
import React from 'react';
import { ArrowRight } from '@/components/assets/ArrowRight';
import { TScreens, useAppStore } from '@/services/store/store';
import { playClickSound } from '@/utils/playClickSound';

type QuestCardProps = {
  title: string;
  icon?: React.ReactNode;
  page: string;
  reward: string;
};

export const QuestCard: React.FC<QuestCardProps> = ({ title, page, reward }) => {
  const setScreen = useAppStore((state) => state.setScreen);

  const handleQuestSelect = () => {
    playClickSound();
    setScreen(page as TScreens);
  };

  return (
    <button
      onClick={handleQuestSelect}
      className="flex h-full items-center justify-between rounded-lg bg-[#293641] px-4 py-3"
    >
      <div className="flex items-center">
        <Image
          src={'/egypt/Ruins/sand_ruins_broken_wall_hieroglyph_01.png'}
          width={40}
          height={40}
          alt="Task Icon"
          priority
        />
        <div className="ml-3">
          <h3 className="text-[0.8rem] leading-[1.8] font-[500] text-[#AFAFAF]">{title}</h3>
          <p className="text-sm font-[600] text-[#F5B83D]">{reward}</p>
        </div>
      </div>

      <div>
        <ArrowRight />
      </div>
    </button>
  );
};
