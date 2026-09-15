import React, { useEffect, useState } from "react";
import Image from "next/image";
import { badgesLists } from "@/services/data/badgeData";
import { useAppStore } from "@/services/store/store";
/* import { HapticFeedback, initHapticFeedback, isSSR } from "@tma.js/sdk-react";
 */
export const RankHeader = () => {
  const setScreen = useAppStore(state => state.setScreen);
  const totalCoinsMined = useAppStore(state => state.user!.totalCoinsMined);
  const rank = useAppStore(state => state.user.rank);

  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  const goToBadges = () => {
    setScreen("badges");
    hapticFeedback?.impactOccurred("soft");
  };

  return (
    <div onClick={goToBadges} className="z-20">
      <div className="text-right flex flex-col items-end text-[0.8rem]">
        <p className="text-left  mb-[2px] text-white">Rank</p>
        <Image src="/img/plankton.svg" alt="Plankton" width={24} height={24} priority />
        <p className="text-left mt-[2px] text-white">
          {"Minnow"} {">"}
        </p>
      </div>
    </div>
  );
};
