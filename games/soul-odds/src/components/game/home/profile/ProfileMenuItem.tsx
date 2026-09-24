import type { ProfileMenuAction } from '@/components/game/home/profile/types';
import { playClickSound } from '@/utils/playClickSound';

export const ProfileMenuItem = (
  props: ProfileMenuAction & {
    tabIndex?: number;
    innerRef?: (node: HTMLButtonElement | null) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  },
) => (
  <button
    ref={props.innerRef}
    type="button"
    role="menuitem"
    tabIndex={props.tabIndex}
    onKeyDown={props.onKeyDown}
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left"
  >
    <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center text-lg">
      {props.icon}
    </span>
    <span className="flex-1 text-sm font-semibold text-white">{props.label}</span>
    <span aria-hidden="true" className="text-white/40">
      ›
    </span>
  </button>
);
