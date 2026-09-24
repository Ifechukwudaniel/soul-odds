import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { playClickSound } from '@/utils/playClickSound';

export const WalletBalanceBadge = (props: { amount: number; currency: string }) => (
  <button
    type="button"
    onClick={playClickSound}
    className="mystic-glass-gold-strong flex items-center gap-2 rounded-full border border-[#F5B83D]/40 bg-black/60 px-3 py-1.5 text-sm font-semibold text-white"
  >
    <CurrencyCoinIcon width={20} height="20" />
    {props.amount.toFixed(2)} {props.currency}
    <span className="text-white/50">▾</span>
  </button>
);
