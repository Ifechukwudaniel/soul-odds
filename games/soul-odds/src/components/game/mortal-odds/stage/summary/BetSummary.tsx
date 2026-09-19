"use client";

import { motion } from "framer-motion";
import { GiScales } from "react-icons/gi";
import { GameButton } from "@/components/game/GameButton";
import { GameCard } from "@/components/game/home/GameCard";
import { betLabel, betOdds } from "@/lib/mortal-odds/bets";
import { fmtYear } from "@/lib/mortal-odds/format";
import { serifFont } from "@/styles/serif-font";
import type { Bet, Draw, MarketPrices, Price, RoundCharge } from "@/types";

export const BetSummary = (props: {
  draw: Draw;
  bets: Record<string, Bet>;
  prices: MarketPrices;
  priceDeathYear: (guessYear: number) => Price;
  charges: RoundCharge[];
  currency: string;
  onBack: () => void;
  onConfirm: () => void;
}) => {
  const rows = Object.values(props.bets).map((bet) => {
    const odds = betOdds({ bet, prices: props.prices, priceDeathYear: props.priceDeathYear });
    return { bet, label: betLabel(bet), odds, payout: odds === null ? 0 : bet.stake * odds };
  });
  const totalStake = rows.reduce((sum, row) => sum + row.bet.stake, 0);
  const maxPayout = rows.reduce((sum, row) => sum + row.payout, 0);
  // The stake row below already accounts for the locked "stake" charge; only side fees (redraws) reduce the best case further.
  const fees = props.charges.filter((charge) => charge.kind === "fee").reduce((sum, charge) => sum + charge.amount, 0);
  const bestCase = maxPayout - totalStake - fees;

  return (
    <GameCard className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto" containerClassName="flex h-full w-full flex-col">
      <div className="flex items-center justify-between">
        <GameButton variant="secondary" onClick={props.onBack} className="px-3 py-1.5 text-sm">
          ← Change your reading
        </GameButton>
        <span className="text-[11px] text-white/40 uppercase tracking-[0.2em]">Before the scales</span>
      </div>

      <div className="flex flex-col items-center text-center">
        <GiScales size={44} className="text-[#F5B83D]" />
        <h3 className={`${serifFont.className} mt-1 font-bold text-white text-2xl`}>The weighing of the heart</h3>
        <p className="mt-1 text-sm text-white/50">
          Born {fmtYear(props.draw.year)} in {props.draw.place.name}, {props.draw.place.continent}
        </p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-white/50 text-xs">
            <th className="pb-2 font-normal">Prediction</th>
            <th className="pb-2 font-normal">Your pick</th>
            <th className="pb-2 text-right font-normal">Odds</th>
            <th className="pb-2 text-right font-normal">Stake</th>
            <th className="pb-2 text-right font-normal">Pays</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <motion.tr
              key={row.bet.marketId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.08 }}
              className="border-white/10 border-t"
            >
              <td className="py-2 text-white/70">{row.label.market}</td>
              <td className="py-2 font-semibold text-white">{row.label.pick}</td>
              <td className="py-2 text-right text-white/70">{row.odds === null ? "—" : row.odds.toFixed(2)}</td>
              <td className="py-2 text-right text-white/70">{row.bet.stake.toFixed(2)}</td>
              <td className="py-2 text-right font-bold text-[#F5B83D]">{row.payout.toFixed(2)}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      <dl className="flex flex-col gap-1 rounded-xl border border-white/10 bg-black/60 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-white/50">Stake</dt>
          <dd className="text-white/70">−{totalStake.toFixed(2)}</dd>
        </div>
        {props.charges
          .filter((charge) => charge.kind === "fee")
          .map((charge) => (
            <div key={charge.id} className="flex justify-between">
              <dt className="text-white/50">{charge.label}</dt>
              <dd className="text-white/70">−{charge.amount.toFixed(2)}</dd>
            </div>
          ))}
        <div className="mt-2 flex justify-between border-white/10 border-t pt-2">
          <dt className="text-white">If the heart is light on every count</dt>
          <dd className="font-bold text-[#6BA84F]">
            +{maxPayout.toFixed(2)} {props.currency}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-white/50">Best case</dt>
          <dd className={bestCase >= 0 ? "text-[#6BA84F]" : "text-[#B7410E]"}>
            {bestCase >= 0 ? "+" : "−"}
            {Math.abs(bestCase).toFixed(2)}
          </dd>
        </div>
      </dl>

      <GameButton variant="papyrus" onClick={props.onConfirm} className="mt-auto px-6 py-3 text-base">
        Set the heart on the scale
      </GameButton>
    </GameCard>
  );
};
