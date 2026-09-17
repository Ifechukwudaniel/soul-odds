import { playClickSound } from "@/utils/playClickSound";

export const ProfileMenuButton = (props: { avatar: React.ReactNode; onClick?: () => void }) => (
  <button
    type="button"
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 py-1 pr-2 pl-1"
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">{props.avatar}</span>
    <span className="text-white/50">▾</span>
  </button>
);
