import React, { useRef } from 'react';
import { TScreens, useAppStore } from '@/services/store/store';
import { playClickSound } from '@/utils/playClickSound';
import { Hieroglyph } from './assets/Hieroglyph';
import { Pyramid } from './assets/Pyramid';
import { Sarcophagus } from './assets/Sarcophagus';
import { Share } from './assets/Share';
import { StatsIcon } from './assets/StatsIcon';
import { MenuBtn } from './MenuBtn';

type MenuLink = {
  label: string;
  icon?: React.ReactNode;
  activeIcon?: React.ReactNode;
};

export const menuLinks: MenuLink[] = [
  {
    label: 'ranks',
    icon: <StatsIcon active={false} />,
    activeIcon: <StatsIcon active />,
  },
  {
    label: 'refs',
    icon: <Share active={false} />,
    activeIcon: <Share active />,
  },
  {
    label: 'home',
    icon: <Pyramid active={false} />,
    activeIcon: <Pyramid active />,
  },
  {
    label: 'history',
    icon: <Sarcophagus active={false} />,
    activeIcon: <Sarcophagus active />,
  },
  {
    label: 'quests',
    icon: <Hieroglyph active={false} />,
    activeIcon: <Hieroglyph active />,
  },
];

// ✦ Left/Right move between tabs; Home/End jump to the ends. Only Left/Right carry a step (a single row of tabs).
const NAV_MOVE: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

export const Menubar = () => {
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleMenuClick = (label: string) => {
    playClickSound();
    setScreen(label as TScreens);
  };

  // ✦ Roving tabindex: only the active tab is a Tab stop. Arrows move focus and switch screens
  //   together, clamped at the ends.
  const moveSelection = (fromIndex: number, key: string) => {
    const delta = NAV_MOVE[key];
    const targetIndex =
      key === 'Home'
        ? 0
        : key === 'End'
          ? menuLinks.length - 1
          : delta === undefined
            ? null
            : fromIndex + delta;
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
      className="gold-gradient fixed bottom-4 left-[50%] my-3 mt-16 w-[calc(100%-2rem)] translate-x-[-50%] rounded-3xl p-px max-md:static max-md:mx-auto max-md:my-0 max-md:mb-[max(0.5rem,env(safe-area-inset-bottom))] max-md:w-full max-md:translate-x-0 md:max-w-md"
    >
      <div
        role="tablist"
        aria-label="Main navigation"
        className="flex w-full items-center justify-center gap-x-[0px] rounded-3xl bg-[#0D2A28] px-3 py-1 md:gap-x-1 md:px-6"
      >
        {menuLinks.map(({ label, icon, activeIcon }, index) => {
          let isActive = screen === label;
          if (label == 'quests' && (screen == 'wallet' || screen == 'social')) {
            isActive = true;
          }

          if (label == 'home' && screen == 'badges') {
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
                if (event.key in NAV_MOVE || event.key === 'Home' || event.key === 'End') {
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
