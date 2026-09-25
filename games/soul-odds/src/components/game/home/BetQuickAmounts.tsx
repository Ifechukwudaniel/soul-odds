import { playClickSound } from '@/utils/playClickSound';

export const BetQuickAmounts = (props: {
  amounts: number[];
  selected: number;
  onSelect: (amount: number) => void;
  disabled?: boolean;
}) => (
  <div className="flex flex-wrap gap-2">
    {props.amounts.map((amount) => (
      <button
        key={amount}
        type="button"
        disabled={props.disabled}
        onClick={() => {
          playClickSound();
          props.onSelect(amount);
        }}
        className={`flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${
          amount === props.selected
            ? 'gold border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]'
            : 'border-black bg-[#262433] text-[#AFAFAF]'
        }`}
      >
        {amount}
      </button>
    ))}
  </div>
);
