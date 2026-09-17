import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MenuBtn } from "./MenuBtn";
import { BoostIcon } from "./assets/BoostIcon";
import { CoinIcon } from "./assets/CoinIcon";
import { SpeakerIcon } from "./assets/SpeakerIcon";
import { StatsIcon } from "./assets/StatsIcon";
import { TaskIcon } from "./assets/TaskIcon";
import { TScreens, useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";
/* import { isSSR , initHapticFeedback, HapticFeedback} from "@tma.js/sdk-react";
 */
type MenuLink = {
  label: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
};

export const menuLinks: MenuLink[] = [
  {
    label: "stats",
    icon: <StatsIcon active={false} />,
    activeIcon: <StatsIcon active />,
  },
  {
    label: "refs",
    icon: <SpeakerIcon active={false} />,
    activeIcon: <SpeakerIcon active />,
  },
  {
    label: "home",
    icon: <CoinIcon active={false} />,
    activeIcon: <CoinIcon active />,
  },
  {
    label: "boost",
    icon: <BoostIcon active={false} />,
    activeIcon: <BoostIcon active />,
  },
  {
    label: "quests",
    icon: <TaskIcon active={false} />,
    activeIcon: <TaskIcon active />,
  },
];

export const Menubar = () => {
  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  /*   useEffect(() => {
    if (typeof window !== 'undefined' && !isSSR()) {
      setHapticFeedback(initHapticFeedback());
    }
  }, []); */

  const screen = useAppStore(state => state.screen);
  const setScreen = useAppStore(state => state.setScreen);

  const handleMenuClick = (label: string) => {
    playClickSound();
    setScreen(label as TScreens);
    hapticFeedback?.impactOccurred("light");
  };

  return (
    <div
      className="gold-gradient p-[1px] my-3 rounded-3xl mt-16 fixed bottom-4 left-[50%] translate-x-[-50%] md:max-w-md"
      style={{
        width: "calc(100% - 2rem)",
      }}
    >
      <div className="bg-[#0D2A28] py-1 px-3 md:px-6 rounded-3xl flex gap-x-[0px] md:gap-x-1 w-full items-center justify-center">
        {menuLinks.map(({ label, icon, activeIcon }) => {
          let isActive = screen === label;
          if (label == "quests" && (screen == "wallet" || screen == "social")) {
            isActive = true;
          }

          if (label == "home" && screen == "badges") {
            isActive = true;
          }

          return (
            <div key={label}>
              <MenuBtn
                label={label}
                icon={icon}
                activeIcon={activeIcon}
                isActive={isActive}
                onClick={() => handleMenuClick(label)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
