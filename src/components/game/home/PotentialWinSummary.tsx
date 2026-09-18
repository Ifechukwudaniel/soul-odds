export const PotentialWinSummary = (props: { amount: number; currency: string; betCount: number }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="flex items-center gap-1.5 text-sm text-white/50">
        <span>✨</span>
        Potential win
      </p>
      <p className="font-bold text-[#F5B83D]">
        {props.amount.toFixed(2)} {props.currency}
      </p>
    </div>
  {/*   <span className="rounded-full border border-blue-400/40 px-2 py-1 text-blue-300 text-xs font-semibold">
      {props.betCount} {props.betCount === 1 ? "bet" : "bets"}
    </span> */}
  </div>
);
