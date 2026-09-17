import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { BetQuickAmounts } from "@/components/game/home/BetQuickAmounts";
import { GameCard } from "@/components/game/home/GameCard";
import { PlaceBetButton } from "@/components/game/home/PlaceBetButton";
import { PotentialWinSummary } from "@/components/game/home/PotentialWinSummary";
import { SlipRow } from "@/components/game/home/SlipRow";
import { betOdds } from "@/lib/mortal-odds/bets";
import type { Bet, MarketPrices, Price } from "@/types";

export const BetPanel = (props: {
  currency: string;
  chipSize: number;
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  bets: Record<string, Bet>;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  onRemoveBet: (marketId: string) => void;
  onPlaceBet: () => void;
  canPlaceBet: boolean;
}) => {
  const bets = Object.values(props.bets);
  const totalStaked = bets.reduce((sum, bet) => sum + bet.stake, 0);
  const potentialWins = bets.map((bet) => {
    if (!props.prices) return null;
    const odds = betOdds({ bet, prices: props.prices, priceDeathYear: props.priceDeathYear });
    return odds === null ? null : bet.stake * odds;
  });
  const totalPotentialWin = potentialWins.reduce((sum: number, win) => sum + (win ?? 0), 0);

  return (
    <GameCard className="flex flex-col gap-4">
      <h2 className="font-bold text-white">Your Bet</h2>

      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3">
        <CurrencyCoinIcon width={28} height="28" />
        <span className="font-bold text-2xl text-white">{totalStaked.toFixed(2)}</span>
        <span className="text-white/50">{props.currency}</span>
      </div>

      <div>
        <p className="mb-2 text-white/50 text-xs">Chip size</p>
        <BetQuickAmounts amounts={props.quickAmounts} selected={props.chipSize} onSelect={props.onSelectChip} />
      </div>

      <div className="flex flex-col gap-2">
        {bets.length === 0 ? (
          <p className="text-sm text-white/40">Draw a human, then pick a trait to add it here.</p>
        ) : (
          bets.map((bet, index) => (
            <SlipRow
              key={bet.marketId}
              bet={bet}
              potentialWin={potentialWins[index] ?? null}
              currency={props.currency}
              onRemove={() => props.onRemoveBet(bet.marketId)}
            />
          ))
        )}
      </div>

      <PotentialWinSummary amount={totalPotentialWin} currency={props.currency} betCount={bets.length} />

      <PlaceBetButton label="Place Bet" disabled={!props.canPlaceBet || bets.length === 0} onClick={props.onPlaceBet} />
    </GameCard>
  );
};
