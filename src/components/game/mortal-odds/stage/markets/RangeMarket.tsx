import { BetAmountSlider } from "@/components/game/home/BetAmountSlider";
import { PayoutLabel } from "@/components/game/mortal-odds/stage/markets/PayoutLabel";
import { DEATH_WINDOW } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import { playClickSound } from "@/utils/playClickSound";
import type { Price } from "@/types";

export const RangeMarket = (props: {
  fromYear: number;
  guessYear: number;
  onGuessChange: (year: number) => void;
  price: Price;
  isOnSlip: boolean;
  chipSize: number;
  onToggle: () => void;
}) => {
  const maxYear = props.fromYear + 105;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="font-bold text-sm text-white">Year of death</h3>
        <p className="text-white/50 text-xs">Win if they die within {DEATH_WINDOW} years of your pick.</p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <output className="font-bold text-lg text-[#F5B83D]">{fmtYear(props.guessYear)}</output>
        <button
          type="button"
          aria-pressed={props.isOnSlip}
          disabled={props.price.odds === null}
          onClick={() => {
            playClickSound();
            props.onToggle();
          }}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 disabled:opacity-40 ${
            props.isOnSlip ? "purple-gradient border-black text-white" : "border-white/10 bg-slate-900/60 text-white"
          }`}
        >
          <span className="font-semibold text-sm">{props.isOnSlip ? "On your slip" : "Add to slip"}</span>
          <PayoutLabel price={props.price} chipSize={props.chipSize} />
        </button>
      </div>

      <BetAmountSlider min={props.fromYear} max={maxYear} value={props.guessYear} onChange={props.onGuessChange} />

      <div className="flex justify-between text-white/40 text-xs">
        <span>{fmtYear(props.fromYear)}</span>
        <span>{fmtYear(maxYear)}</span>
      </div>
    </div>
  );
};
