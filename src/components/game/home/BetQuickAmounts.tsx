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
            ? "purple-gradient border-black text-white shadow-[inset_1px_1px_1.5px_0px_#FFFFFF47]"
            : "border-black bg-[#262433] text-[#AFAFAF]"
        }`}
      >
        {amount}
      </button>
    ))}
  </div>
);
