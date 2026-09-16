import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { BetQuickAmounts } from "@/components/game/home/BetQuickAmounts";
import { GameCard } from "@/components/game/home/GameCard";
import { PlaceBetButton } from "@/components/game/home/PlaceBetButton";
import { PotentialWinSummary } from "@/components/game/home/PotentialWinSummary";

export const BetPanel = (props: {
  currency: string;
  betAmount: number;
  minAmount: number;
  maxAmount: number;
  quickAmounts: number[];
  potentialWinMultiplier: number;
  onSelectAmount: (amount: number) => void;
}) => (
  <GameCard className="flex flex-col gap-4">
    <h2 className="font-bold text-white">Your Bet</h2>

    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
      <CurrencyCoinIcon width={28} height="28" />
      <span className="text-2xl font-bold text-white">{props.betAmount.toFixed(2)}</span>
      <span className="text-white/50">{props.currency}</span>
    </div>

    <BetQuickAmounts
      amounts={props.quickAmounts}
      selected={props.betAmount}
      onSelect={props.onSelectAmount}
    />

    <input
      type="range"
      min={props.minAmount}
      max={props.maxAmount}
      step={1}
      value={props.betAmount}
      onChange={(event) => props.onSelectAmount(Number(event.target.value))}
      className="accent-[#6752EF]"
    />

    <PotentialWinSummary
      amount={props.betAmount * props.potentialWinMultiplier}
      currency={props.currency}
      multiplier={props.potentialWinMultiplier}
    />

    <PlaceBetButton label="Place Bet" />
  </GameCard>
);
