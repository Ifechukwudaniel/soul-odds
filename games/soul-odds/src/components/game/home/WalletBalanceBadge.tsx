import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { playClickSound } from '@/utils/playClickSound';

export const WalletBalanceBadge = (props: { amount: number; currency: string }) => (
  <button
    type="button"
    onClick={playClickSound}
    className="mystic-glass-gold-strong flex min-w-0 items-center gap-1.5 rounded-full border border-[#F5B83D]/40 bg-black/60 px-2.5 py-1.5 text-sm font-semibold whitespace-nowrap text-white md:gap-2 md:px-3"
  >
    <CurrencyCoinIcon width={20} height="20" />
    <span>
      <span className="max-md:tabular-nums">{props.amount.toFixed(2)}</span>
      <span className="max-sm:hidden"> {props.currency}</span>
    </span>
    <span className="text-white/50 max-sm:hidden">▾</span>
  </button>
);
