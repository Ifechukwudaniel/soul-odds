import { LuChevronDown } from 'react-icons/lu';
import { serifFont } from '@/styles/serif-font';
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
      className="mystic-glass-gold-strong fixed! bottom-32 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer items-center gap-3 rounded-full px-5 py-2.5 whitespace-nowrap transition-transform duration-100 active:translate-y-0.5 max-md:bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom)+0.75rem)] max-md:gap-2 max-md:px-4 max-md:py-2"
    >
      <span className="text-[0.7rem] tracking-[0.15em] text-white/50 uppercase">Your rank</span>
      <span className={`${serifFont.className} gold-text-2 text-lg leading-none`}>
        #{user.rank}
      </span>
      <span className="h-4 w-px bg-[#F5B83D]/30" aria-hidden />
      <span className="flex items-center gap-1 text-sm font-semibold text-[#F5B83D]">
        Jump to me <LuChevronDown aria-hidden size={16} />
      </span>
    </button>
  );
}
