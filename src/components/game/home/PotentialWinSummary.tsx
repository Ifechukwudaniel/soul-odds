export const PotentialWinSummary = (props: { amount: number; currency: string; multiplier: number }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="flex items-center gap-1.5 text-sm text-white/50">
        <span>✨</span>
        Potential Win
      </p>
      <p className="font-bold text-[#9181F0]">
        {props.amount.toFixed(2)} {props.currency}
      </p>
    </div>
    <span className="rounded-full border border-blue-400/40 px-2 py-1 text-xs font-semibold text-blue-300">
      {props.multiplier.toFixed(2)}x
    </span>
  </div>
);
