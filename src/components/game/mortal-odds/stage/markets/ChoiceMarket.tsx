import { PayoutLabel } from "@/components/game/mortal-odds/stage/markets/PayoutLabel";
import { playClickSound } from "@/utils/playClickSound";
import type { MarketConfig, Price } from "@/types";

export const ChoiceMarket = (props: {
  market: MarketConfig;
  prices: Record<string, Price>;
  selectedOptionId: string | undefined;
  chipSize: number;
  onSelect: (optionId: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    <div>
      <h3 className="font-bold text-sm text-white">{props.market.title}</h3>
      {props.market.note && <p className="text-white/50 text-xs">{props.market.note}</p>}
    </div>

    <div className="grid grid-cols-2 gap-1.5">
      {props.market.options.map((option) => {
        const price = props.prices[option.id];
        const isSelected = props.selectedOptionId === option.id;
        return (
          <button
            type="button"
            key={option.id}
            disabled={!price || price.odds === null}
            aria-pressed={isSelected}
            onClick={() => {
              playClickSound();
              props.onSelect(option.id);
            }}
            className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-1.5 text-left disabled:opacity-40 ${
              isSelected ? "purple-gradient border-black text-white" : "border-white/10 bg-slate-900/60 text-white"
            }`}
          >
            <span className="font-semibold text-sm">{option.label}</span>
            <PayoutLabel price={price} chipSize={props.chipSize} />
          </button>
        );
      })}
    </div>
  </div>
);
