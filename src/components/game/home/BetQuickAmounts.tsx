export const BetQuickAmounts = (props: {
  amounts: number[];
  selected: number;
  onSelect: (amount: number) => void;
}) => (
  <div className="flex flex-wrap gap-2">
    {props.amounts.map((amount) => (
      <button
        key={amount}
        type="button"
        onClick={() => props.onSelect(amount)}
        className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold ${
          amount === props.selected
            ? "border-[#6752EF] bg-[#6752EF]/10 text-[#9181F0]"
            : "border-white/10 bg-slate-900/60 text-white/70"
        }`}
      >
        {amount}
      </button>
    ))}
  </div>
);
