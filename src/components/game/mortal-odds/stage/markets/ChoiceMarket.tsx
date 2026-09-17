import type { IconType } from "react-icons";
import { FaBookOpen, FaCity, FaHourglassHalf, FaRegQuestionCircle, FaVenusMars } from "react-icons/fa";
import { playClickSound } from "@/utils/playClickSound";
import type { MarketConfig, Price } from "@/types";

const MARKET_ICONS: Record<string, IconType> = {
  sex: FaVenusMars,
  age: FaHourglassHalf,
  read: FaBookOpen,
  city: FaCity,
};

export const ChoiceMarket = (props: {
  market: MarketConfig;
  prices: Record<string, Price>;
  selectedOptionId: string | undefined;
  onSelect: (optionId: string) => void;
}) => {
  const Icon = MARKET_ICONS[props.market.id] ?? FaRegQuestionCircle;
  const selectedPrice = props.selectedOptionId ? props.prices[props.selectedOptionId] : undefined;
  const selectedOdds = selectedPrice?.odds;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
      <div className="flex flex-col items-center gap-1">
        <Icon size={32} className="text-[#3FB6A8]" />
        <h3 className="font-bold text-white text-xl">{props.market.title}</h3>
        {props.market.note && <p className="max-w-xs text-white/40 text-xs">{props.market.note}</p>}
        <p className="mt-1 text-white/40 text-[11px]">Bookie odds</p>
        <p className="font-bold text-2xl text-[#F5B83D] leading-tight">
          {selectedOdds === null || selectedOdds === undefined ? "—" : selectedOdds.toFixed(2)}
        </p>
      </div>

      <div className="grid w-full max-w-xl grid-cols-2 gap-3">
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
              className={`rounded-lg border px-4 py-4 font-semibold text-base disabled:opacity-40 ${
                isSelected
                  ? "accent-gradient border-black text-slate-950 shadow-[inset_1px_1px_1.5px_0px_#FFFFFF66]"
                  : "border-black bg-[#262433] text-[#AFAFAF]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
