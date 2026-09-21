import React from "react";
import Image from "next/image";
import { Balance } from "../../Balance";
import { ArrowRight } from "@/components/assets/ArrowRight";
import { TScreens, useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";

type QuestCardProps = {
  title: string;
  icon?: React.ReactNode;
  page: string;
};

export const QuestCard: React.FC<QuestCardProps> = ({ title, page }) => {
  const setScreen = useAppStore(state => state.setScreen);

  const handleQuestSelect = () => {
    playClickSound();
    setScreen(page as TScreens);
  };

  return (
    <button
      onClick={handleQuestSelect}
      className="bg-[#293641] py-3 px-4 rounded-lg h-full flex items-center justify-between"
    >
      <div className="flex items-center">
        <Image src={"/egypt/Ruins/sand_ruins_broken_wall_hieroglyph_01.png"} width={40} height={40} alt="Task Icon" priority />
        <div className="ml-3">
          <h3 className="text-[0.8rem] font-[500] leading-[1.8] text-[#AFAFAF]">{title}</h3>
          <Balance size="sm" count={120000} />
        </div>
      </div>

      <div>
        <ArrowRight />
      </div>
    </button>
  );
};
