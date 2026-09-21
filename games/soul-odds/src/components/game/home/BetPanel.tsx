import { motion } from "framer-motion";
import { CurrencyCoinIcon } from "@/components/assets/CurrencyCoinIcon";
import { BetQuickAmounts } from "@/components/game/home/BetQuickAmounts";
import { GameCard } from "@/components/game/home/GameCard";
import { PlaceBetButton } from "@/components/game/home/PlaceBetButton";
import { PotentialWinSummary } from "@/components/game/home/PotentialWinSummary";
import { SlipRow } from "@/components/game/home/SlipRow";
import { betOdds } from "@/lib/mortal-odds/bets";
import { serifFont } from "@/styles/serif-font";
import type { Bet, MarketPrices, Price, RoundCharge } from "@/types";

export const BetPanel = (props: {
  currency: string;
  chipSize: number;
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  chipLocked: boolean;
  bets: Record<string, Bet>;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  onRemoveBet: (marketId: string) => void;
  charges: RoundCharge[];
  onPlaceBet: () => void;
  canPlaceBet: boolean;
  isLocked: boolean;
  requiredBets: number;
}) => {
  const bets = Object.values(props.bets);
  const potentialWins = bets.map((bet) => {
    if (!props.prices) return null;
    const odds = betOdds({ bet, prices: props.prices, priceDeathYear: props.priceDeathYear });
    return odds === null ? null : bet.stake * odds;
  });
  const totalPotentialWin = potentialWins.reduce((sum: number, win) => sum + (win ?? 0), 0);
  // Bet stakes are a breakdown of the "stake" charge already locked in at summon, not additional spend.
  const atRisk = props.charges.reduce((sum, charge) => sum + charge.amount, 0);
  const unpicked = Math.max(0, props.requiredBets - bets.length);

  return (
    <GameCard className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" containerClassName="flex h-full w-full flex-col">
      <h2 className={`${serifFont.className} font-bold text-white"`}>Your wager</h2>

      <div className="mystic-glass flex items-center gap-2 rounded-xl px-4 py-3">
  <CurrencyCoinIcon width={28} height={"28"} />

  <span className="text-2xl font-bold text-white">
    {atRisk.toFixed(2)}
  </span>

  <span className="text-white/50">{props.currency}</span>
</div>

      <PotentialWinSummary amount={totalPotentialWin} currency={props.currency} betCount={bets.length} />

      {props.canPlaceBet && (
        <div className="flex flex-col gap-1">
          <PlaceBetButton label="Place Bet" disabled={unpicked > 0} onClick={props.onPlaceBet} />
        </div>
      )}

      <div className="flex flex-col gap-1">
        {props.charges.map((charge) => (
          <motion.div
            key={charge.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-white/60">{charge.label}</span>
            <span className="font-semibold text-[#F5B83D]">
              −{charge.amount.toFixed(2)} {props.currency}
            </span>
          </motion.div>
        ))}
        {props.charges.length === 0 && <p className="text-sm text-white/40">Nothing on the scales yet. Pick your stake, then summon a soul.</p>}
      </div>

      <div>
        <BetQuickAmounts amounts={props.quickAmounts} selected={props.chipSize} onSelect={props.onSelectChip} disabled={props.chipLocked} />
      </div>

      <div className="flex flex-col gap-2">
        {bets.map((bet, index) => (
          <SlipRow
            key={bet.marketId}
            bet={bet}
            potentialWin={potentialWins[index] ?? null}
            onRemove={props.isLocked ? undefined : () => props.onRemoveBet(bet.marketId)}
          />
        ))}
      </div>

    </GameCard>
  );
};
