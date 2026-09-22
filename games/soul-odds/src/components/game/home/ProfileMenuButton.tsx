import { playClickSound } from "@/utils/playClickSound";

export const ProfileMenuButton = (props: { avatar: React.ReactNode; onClick?: () => void }) => (
  <button
    type="button"
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="flex items-center gap-2 rounded-full border mystic-glass-gold  py-1 pr-4 pl-2 bg-white/10"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{props.avatar}</span>
    <span className="text-white/50">▾</span>
  </button>
);
