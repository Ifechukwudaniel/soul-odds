import { PiXBold } from 'react-icons/pi';
import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { betLabel } from '@/lib/mortal-odds/bets';
import type { SinNarratives } from '@/lib/mortal-odds/sin-variants';
import type { Bet } from '@/types';
import { playClickSound } from '@/utils/playClickSound';

export const SlipRow = (props: {
  bet: Bet;
  potentialWin: number | null;
  onRemove?: () => void;
  sinNarratives: SinNarratives | null;
}) => {
  const label = betLabel(props.bet, props.sinNarratives);

  return (
    <div className="mystic-glass flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-black/60 px-3 py-2 shadow-[inset_0_1px_0_0_#ffffff0d]">
      <div>
        <span className="block text-xs text-white/50">{label.market}</span>
        <span className="text-sm font-semibold text-white">{label.pick}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full border border-[#F5B83D]/30 bg-[#F5B83D]/10 py-1 pr-2.5 pl-1.5 text-sm font-bold text-[#F5B83D]">
          <CurrencyCoinIcon width={14} height="14" />
          {props.potentialWin === null ? '—' : props.potentialWin.toFixed(2)}
        </span>
        {props.onRemove && (
          <button
            type="button"
            aria-label="Remove bet"
            onClick={() => {
              playClickSound();
              props.onRemove?.();
            }}
            className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:border-[#B7410E]/40 hover:bg-[#B7410E]/10 hover:text-[#B7410E]"
          >
            <PiXBold className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};
