import React, { useRef, useState } from "react";
import { MenuBtn } from "./MenuBtn";
import { StatsIcon } from "./assets/StatsIcon";
import { TScreens, useAppStore } from "@/services/store/store";
import { playClickSound } from "@/utils/playClickSound";
import {Pyramid} from "./assets/Pyramid";
import  { Hieroglyph } from "./assets/Hieroglyph";
import  { Ankh } from "./assets/Ankh";
import { Share } from "./assets/Share";

type MenuLink = {
  label: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
};

export const menuLinks: MenuLink[] = [
  {
    label: "ranks",
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

// Left/Right move between tabs; Home/End jump to the ends. Only Left/Right carry a step (a single row of tabs).
const NAV_MOVE: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export const Menubar = () => {
  const [hapticFeedback, setHapticFeedback] = useState<HapticFeedback | null>(null);

  const screen = useAppStore(state => state.screen);
  const setScreen = useAppStore(state => state.setScreen);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleMenuClick = (label: string) => {
    playClickSound();
    setScreen(label as TScreens);
    hapticFeedback?.impactOccurred("light");
  };

  // Roving tabindex: only the active tab is a Tab stop, like a native tab list. Arrow keys move focus and
  // switch screens together — the same immediate action a click already takes — clamped at the ends, not wrapped.
  const moveSelection = (fromIndex: number, key: string) => {
    const delta = NAV_MOVE[key];
    const targetIndex = key === "Home" ? 0 : key === "End" ? menuLinks.length - 1 : delta === undefined ? null : fromIndex + delta;
    if (targetIndex === null) {
      return;
    }
    const target = menuLinks[Math.min(Math.max(targetIndex, 0), menuLinks.length - 1)];
    if (!target) {
      return;
    }
    handleMenuClick(target.label);
    buttonRefs.current[target.label]?.focus();
  };

  return (
    <div
      className="gold-gradient p-px my-3 rounded-3xl mt-16 fixed bottom-4 left-[50%] translate-x-[-50%] md:max-w-md"
      style={{
        width: "calc(100% - 2rem)",
      }}
    >
      <div role="tablist" aria-label="Main navigation" className="bg-[#0D2A28] py-1 px-3 md:px-6 rounded-3xl flex gap-x-[0px] md:gap-x-1 w-full items-center justify-center">
        {menuLinks.map(({ label, icon, activeIcon }, index) => {
          let isActive = screen === label;
          if (label == "quests" && (screen == "wallet" || screen == "social")) {
            isActive = true;
          }

          if (label == "home" && screen == "badges") {
            isActive = true;
          }

          return (
            <MenuBtn
              key={label}
              label={label}
              icon={icon}
              activeIcon={activeIcon}
              isActive={isActive}
              onClick={() => handleMenuClick(label)}
              innerRef={(node) => {
                buttonRefs.current[label] = node;
              }}
              onKeyDown={(event) => {
                if (event.key in NAV_MOVE || event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  moveSelection(index, event.key);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
