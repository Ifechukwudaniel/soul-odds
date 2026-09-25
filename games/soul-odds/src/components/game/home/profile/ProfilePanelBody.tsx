'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef, useState } from 'react';
import { FaCog, FaMedal, FaUser } from 'react-icons/fa';
import { GiScrollUnfurled } from 'react-icons/gi';
import { AvatarView } from '@/components/game/home/profile/AvatarView';
import { HowItWorksView } from '@/components/game/home/profile/HowItWorksView';
import { LeaderboardRankRow } from '@/components/game/home/profile/LeaderboardRankRow';
import { ProfileHeader } from '@/components/game/home/profile/ProfileHeader';
import { ProfileMenuList } from '@/components/game/home/profile/ProfileMenuList';
import { SettingsView } from '@/components/game/home/profile/SettingsView';
import type { ProfileMenuAction } from '@/components/game/home/profile/types';

gsap.registerPlugin(useGSAP);

const MENU_ICON_CLASS = 'h-5 w-5 text-white/80';

type View = 'menu' | 'settings' | 'avatar' | 'how';

// ✦ Matches the panel's 24px padding, so a sliding view never leaves the card.
const SHIFT_PX = 24;
const OUT = { duration: 0.2, ease: 'power2.in' };
const IN = { duration: 0.42, ease: 'power3.out' };
// ✦ Just enough overlap to read as one motion; more and the two views' text shows through each other.
const OVERLAP_S = 0.04;

const FOCUSABLE = 'button:not([disabled]), input:not([disabled]), [href], [tabindex="0"]';

// ✦ Where focus lands when a view opens, and on which menu item it returns when the view closes.
//   The menu's own tab stop only follows the arrow keys, so the opener is named explicitly.
const ENTER_FOCUS: Record<Exclude<View, 'menu'>, string> = {
  settings: FOCUSABLE,
  avatar: '[role="radio"][tabindex="0"]',
  // ✦ The scroller's own arrow buttons would match a generic selector, so this view focuses itself.
  how: 'self',
};
const RETURN_FOCUS: Record<Exclude<View, 'menu'>, string> = {
  settings: '[data-action="settings"]',
  avatar: '[data-action="edit-icon"]',
  how: '[data-action="how-it-works"]',
};

// =====================================
// ⬢ Component
// =====================================

/**
 * The profile card's content: the profile menu, settings, avatar picker and "How it works" are
 * stacked in one grid cell, so the card is always as tall as the profile menu and never resizes.
 * Settings centres in the space; the size-contained views fill it and scroll inside. A GSAP timeline slides one
 * view out and the next in.
 */
export const ProfilePanelBody = (props: {
  username: string;
  handle: string;
  rank: string;
  avatarId: string;
  onViewRankPage: () => void;
}) => {
  const [view, setView] = useState<View>('menu');
  const rootRef = useRef<HTMLDivElement>(null);
  const viewRefs = useRef<Record<View, HTMLDivElement | null>>({
    menu: null,
    settings: null,
    avatar: null,
    how: null,
  });
  const { contextSafe } = useGSAP({ scope: rootRef });

  // ✦ Scoped with contextSafe, so a click after the card closes can't touch removed nodes.
  const showView = contextSafe((next: View) => {
    if (next === view) {
      return;
    }
    const from = viewRefs.current[view];
    const to = viewRefs.current[next];
    if (!from || !to) {
      return;
    }
    // ✦ Sub-views enter from the right and leave to the right, so "back" always reads as going back.
    const direction = next === 'menu' ? -1 : 1;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setView(next);

    const focusIncoming = () => {
      const selector =
        next === 'menu' ? RETURN_FOCUS[view as Exclude<View, 'menu'>] : ENTER_FOCUS[next];
      (selector === 'self' ? to : to.querySelector<HTMLElement>(selector))?.focus({
        preventScroll: true,
      });
    };

    gsap.killTweensOf([from, to]);
    if (reduced) {
      gsap.set(from, { autoAlpha: 0, x: 0 });
      gsap.set(to, { autoAlpha: 1, x: 0 });
      focusIncoming();
      return;
    }
    gsap
      .timeline({ onComplete: focusIncoming })
      .to(from, { autoAlpha: 0, x: -direction * SHIFT_PX, ...OUT })
      .fromTo(
        to,
        { autoAlpha: 0, x: direction * SHIFT_PX },
        { autoAlpha: 1, x: 0, ...IN },
        `-=${OVERLAP_S}`,
      );
  });

  const menuActions: ProfileMenuAction[] = [
    {
      id: 'edit-icon',
      label: 'Edit Profile Icon',
      icon: <FaUser className={MENU_ICON_CLASS} />,
      onClick: () => showView('avatar'),
    },
    {
      id: 'rank-page',
      label: 'View Rank Page',
      icon: <FaMedal className={MENU_ICON_CLASS} />,
      onClick: props.onViewRankPage,
    },
    {
      id: 'how-it-works',
      label: 'How it works',
      icon: <GiScrollUnfurled className={MENU_ICON_CLASS} />,
      onClick: () => showView('how'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <FaCog className={MENU_ICON_CLASS} />,
      onClick: () => showView('settings'),
    },
  ];

  return (
    <div
      ref={rootRef}
      className="grid"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && view !== 'menu') {
          event.stopPropagation();
          showView('menu');
        }
      }}
    >
      <div
        ref={(node) => {
          viewRefs.current.menu = node;
        }}
        inert={view !== 'menu'}
        className="col-start-1 row-start-1 flex flex-col gap-5 self-center"
      >
        <ProfileHeader
          username={props.username}
          handle={props.handle}
          rank={props.rank}
          avatarId={props.avatarId}
          onEditAvatar={() => showView('avatar')}
        />
        <LeaderboardRankRow rank="" onClick={props.onViewRankPage} />
        <hr className="border-white/10" />
        <ProfileMenuList actions={menuActions} />
      </div>

      <div
        ref={(node) => {
          viewRefs.current.settings = node;
        }}
        inert={view !== 'settings'}
        className="invisible col-start-1 row-start-1 flex flex-col gap-5 self-center opacity-0"
      >
        <SettingsView onBack={() => showView('menu')} />
      </div>

      {/* ✦ contain: size gives this view no height of its own, so it takes the card's and never stretches it. */}
      <div
        ref={(node) => {
          viewRefs.current.avatar = node;
        }}
        inert={view !== 'avatar'}
        className="invisible col-start-1 row-start-1 flex min-h-0 flex-col gap-5 opacity-0 [contain:size]"
      >
        <AvatarView onBack={() => showView('menu')} />
      </div>

      <div
        ref={(node) => {
          viewRefs.current.how = node;
        }}
        inert={view !== 'how'}
        tabIndex={-1}
        className="invisible col-start-1 row-start-1 flex min-h-0 flex-col gap-4 opacity-0 [contain:size] outline-none"
      >
        <HowItWorksView onBack={() => showView('menu')} />
      </div>
    </div>
  );
};
