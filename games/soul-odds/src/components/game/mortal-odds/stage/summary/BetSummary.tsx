'use client';

import { motion } from 'framer-motion';
import { GiScales } from 'react-icons/gi';
import { CurrencyCoinIcon } from '@/components/assets/CurrencyCoinIcon';
import { AnubisBackdrop } from '@/components/game/AnubisBackdrop';
import { GameButton } from '@/components/game/GameButton';
import { GameCard } from '@/components/game/home/GameCard';
import { betLabel, betOdds } from '@/lib/mortal-odds/bets';
import { getMarketIcon } from '@/lib/mortal-odds/market-icons';
import type { SinNarratives } from '@/lib/mortal-odds/sin-variants';
import { serifFont } from '@/styles/serif-font';
import type { Bet, Draw, MarketPrices, Price, RoundCharge } from '@/types';

const COUNT_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];

export const BetSummary = (props: {
  draw: Draw;
  bets: Record<string, Bet>;
  prices: MarketPrices;
  priceDeathYear: (guessYear: number) => Price;
  charges: RoundCharge[];
  currency: string;
  onBack: () => void;
  onConfirm: () => void;
  sinNarratives: SinNarratives | null;
}) => {
  const rows = Object.values(props.bets).map((bet) => {
    const odds = betOdds({ bet, prices: props.prices, priceDeathYear: props.priceDeathYear });
    return {
      bet,
      label: betLabel(bet, props.sinNarratives),
      odds,
      payout: odds === null ? 0 : bet.stake * odds,
    };
  });
  const totalStake = rows.reduce((sum, row) => sum + row.bet.stake, 0);
  const maxPayout = rows.reduce((sum, row) => sum + row.payout, 0);
  const pickCount = rows.length;
  const pickCountWord = COUNT_WORDS[pickCount] ?? String(pickCount);
  const truthsSubtitle = `${pickCountWord} truth${pickCount === 1 ? '' : 's'} ${pickCount === 1 ? 'stands' : 'stand'} before the scales.`;

  return (
    <GameCard
      scrollable
      className="relative isolate flex flex-col gap-4"
      containerClassName="flex h-full w-full flex-col"
    >
      <AnubisBackdrop />

      <div className="flex items-center justify-between">
        <GameButton variant="secondary" onClick={props.onBack} className="px-3 py-1.5 text-sm">
          ← Change your reading
        </GameButton>
      </div>

      <div className="flex flex-col items-center text-center">
        <GiScales size={44} className="text-[#F5B83D]" />
        <h3 className={`${serifFont.className} mt-1 text-2xl font-bold text-[#F3D38F]`}>
          Your soul reading
        </h3>
        <p className="mt-1 text-[0.8rem] text-white/50">{truthsSubtitle}</p>
      </div>

      <div className="gold-gradient mt-auto rounded-2xl p-px">
        <div className="flex flex-col gap-4 rounded-2xl bg-[#0A1412] p-4">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-1 text-[10px] tracking-[0.15em] text-white/40 uppercase">
              <span>Your picks</span>
              <span className="text-right">Odds</span>
              <span className="text-right">Stake</span>
              <span className="text-right">Payout</span>
            </div>

            {rows.map((row, index) => {
              const Icon = getMarketIcon(row.bet.marketId);
              return (
                <motion.div
                  key={row.bet.marketId}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.08 }}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F5B83D]/30 bg-[#F5B83D]/10 text-[#F5B83D]">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-white/50">{row.label.market}</p>
                      <p className="truncate text-sm font-semibold text-white">{row.label.pick}</p>
                    </div>
                  </div>
                  <span className="text-right text-sm text-white/70">
                    {row.odds === null ? '—' : row.odds.toFixed(2)}
                  </span>
                  <span className="flex items-center justify-end gap-1 text-right text-sm text-white/70">
                    <CurrencyCoinIcon width={14} height="14" />
                    {row.bet.stake.toFixed(2)}
                  </span>
                  <span className="flex items-center justify-end gap-1 text-right text-sm font-bold text-[#F5B83D]">
                    <CurrencyCoinIcon width={14} height="14" />
                    {row.payout.toFixed(2)}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {props.charges.some((charge) => charge.kind === 'fee') && (
            <dl className="flex flex-col gap-1 text-xs">
              {props.charges
                .filter((charge) => charge.kind === 'fee')
                .map((charge) => (
                  <div key={charge.id} className="flex justify-between">
                    <dt className="text-white/50">{charge.label}</dt>
                    <dd className="text-white/50">−{charge.amount.toFixed(2)}</dd>
                  </div>
                ))}
            </dl>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="mystic-glass flex items-center justify-between gap-2 rounded-xl border bg-black/80 px-4 py-2.5">
              <span className="text-[12px] tracking-[0.15em] text-white/50">Total stake</span>
              <span className="flex items-center gap-1 text-sm font-bold text-white">
                <CurrencyCoinIcon width={14} height="14" />
                {totalStake.toFixed(2)}
              </span>
            </div>
            <div className="mystic-glass flex items-center justify-between gap-2 rounded-xl border bg-black/80 px-4 py-2.5">
              <span className="text-[12px] tracking-[0.15em] text-white/50">Potential win</span>
              <span className="flex items-center gap-1 text-base font-bold text-[#F5B83D]">
                <CurrencyCoinIcon width={18} height="18" />
                {maxPayout.toFixed(2)}
              </span>
            </div>
          </div>

          <GameButton variant="papyrus" onClick={props.onConfirm} className="px-6 py-2 text-base">
            Let the scale decide
          </GameButton>
        </div>
      </div>
    </GameCard>
  );
};
