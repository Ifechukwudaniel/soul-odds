import { playClickSound } from '@/utils/playClickSound';

export const ProfileMenuButton = (props: { avatar: React.ReactNode; onClick?: () => void }) => (
  <button
    type="button"
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="mystic-glass-gold flex items-center gap-2 rounded-full border bg-white/10 py-1 pr-2 pl-2 sm:pr-4"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
      {props.avatar}
    </span>
    <span className="text-white/50 max-sm:hidden">▾</span>
  </button>
);
