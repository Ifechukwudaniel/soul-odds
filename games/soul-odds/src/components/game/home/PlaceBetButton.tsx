import { playClickSound } from "@/utils/playClickSound";

export const PlaceBetButton = (props: { label: string; disabled?: boolean; onClick?: () => void }) => (
  <button
    type="button"
    disabled={props.disabled}
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white py-3 font-bold text-slate-950 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {props.label}
    <span>→</span>
  </button>
);
