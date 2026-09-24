'use client';

import { useRef, useState } from 'react';
import { ProfileMenuItem } from '@/components/game/home/profile/ProfileMenuItem';
import type { ProfileMenuAction } from '@/components/game/home/profile/types';

// Up/Down move between items; Home/End jump to the ends.
const MOVE: Record<string, number> = { ArrowDown: 1, ArrowUp: -1 };

/**
 * A vertical action menu with roving-tabindex keyboard nav: only one item is ever a Tab stop, arrow keys move
 * it between items (clamped at the ends), and Enter/Space activate — like a native menu, not a tab list, since
 * each item is a one-off action (open a picker, navigate away) rather than a persistent selected state.
 */
export const ProfileMenuList = (props: { actions: ProfileMenuAction[] }) => {
  const [rovingIndex, setRovingIndex] = useState(0);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const moveFocus = (fromIndex: number, key: string) => {
    const delta = MOVE[key];
    const targetIndex =
      key === 'Home'
        ? 0
        : key === 'End'
          ? props.actions.length - 1
          : delta === undefined
            ? null
            : fromIndex + delta;
    if (targetIndex === null) {
      return;
    }
    const clamped = Math.min(Math.max(targetIndex, 0), props.actions.length - 1);
    const target = props.actions[clamped];
    if (!target) {
      return;
    }
    setRovingIndex(clamped);
    itemRefs.current[target.id]?.focus();
  };

  return (
    <div role="menu" aria-orientation="vertical" className="flex flex-col gap-2">
      {props.actions.map((action, index) => (
        <ProfileMenuItem
          key={action.id}
          {...action}
          tabIndex={index === rovingIndex ? 0 : -1}
          innerRef={(node) => {
            itemRefs.current[action.id] = node;
          }}
          onKeyDown={(event) => {
            if (event.key in MOVE || event.key === 'Home' || event.key === 'End') {
              event.preventDefault();
              moveFocus(index, event.key);
            }
          }}
        />
      ))}
    </div>
  );
};
