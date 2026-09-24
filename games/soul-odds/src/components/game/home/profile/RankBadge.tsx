import { FaStar } from 'react-icons/fa';
import { playClickSound } from '@/utils/playClickSound';

export const RankBadge = (props: { label: string; onClick?: () => void }) => (
  <button
    type="button"
    onClick={() => {
      playClickSound();
      props.onClick?.();
    }}
    className="text-white accent-gradient gold flex items-center gap-2 rounded-full border border-black px-4 py-1.5 text-sm font-bold text-slate-950"
  >
    <FaStar className="h-4 w-4" />
    {props.label}
    <span className="text-white/70">›</span>
  </button>
);
