import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MenuBtn } from "./MenuBtn";
import { SpeakerIcon } from "./assets/SpeakerIcon";
import { StatsIcon } from "./assets/StatsIcon";
import { TScreens, useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";
import {Pyramid} from "./assets/Pyramid";
import  { Hieroglyph } from "./assets/Hieroglyph";
import  { Ankh } from "./assets/Ankh";
import { Share } from "./assets/Share";
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
    icon: <Share active={false} />,
    activeIcon: <Share active />,
  },
  {
    label: "home",
    icon: <Pyramid active={false} />,
    activeIcon: <Pyramid active />,
  },
  {
    label: "boost",
    icon: <Ankh active={false} />,
    activeIcon: <Ankh active />,
  },
  {
    label: "quests",
    icon: <Hieroglyph active={false} />,
    activeIcon: <Hieroglyph active />,
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
