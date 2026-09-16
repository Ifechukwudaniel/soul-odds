import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";

export const WalletBalanceBadge = (props: { amount: number; currency: string }) => (
  <button
    type="button"
    className="flex items-center gap-2 rounded-full border border-blue-400/40 bg-slate-900/60 px-3 py-1.5 text-sm font-semibold text-white"
  >
    <CurrencyCoinIcon width={20} height="20" />
    {props.amount.toFixed(2)} {props.currency}
    <span className="text-white/50">▾</span>
  </button>
);
