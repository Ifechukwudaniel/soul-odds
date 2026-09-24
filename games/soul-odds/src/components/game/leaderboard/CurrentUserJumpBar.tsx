import type { LeaderboardUser } from '@/types';

interface CurrentUserJumpBarProps {
  user: LeaderboardUser;
  /** Only rendered when true — i.e. the user's row is out of view. */
  visible: boolean;
  onJump: () => void;
}

export function CurrentUserJumpBar({ user, visible, onJump }: CurrentUserJumpBarProps) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onJump}
      className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-full bg-[#0B0F1A] px-5 py-3 whitespace-nowrap shadow-lg ring-1 ring-white/10 max-md:bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom)+0.75rem)] max-md:gap-2 max-md:px-4 max-md:py-2.5"
    >
      <span className="text-sm text-[#AFAFAF]">Your rank</span>
      <span className="font-[700] text-white">#{user.rank}</span>
      <span className="flex items-center gap-1 text-sm font-[600] text-blue-400">
        Jump to me <span aria-hidden>↓</span>
      </span>
    </button>
  );
}
