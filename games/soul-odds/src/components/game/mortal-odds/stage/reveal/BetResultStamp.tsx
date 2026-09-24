'use client';

import { motion } from 'framer-motion';
import { RevealStamp } from '@/components/game/mortal-odds/stage/reveal/RevealStamp';
import type { BetResult } from '@/types';

/**
 * The full round's verdict as one paper-card popup: every bet, the skill score, and the net
 * result, all stamped onto a single pinned note. Stays up until the player taps it away.
 */
export const BetResultStamp = (props: {
  results: BetResult[];
  skill: number;
  roundNet: number;
  currency: string;
  onDismiss: () => void;
}) => {
  const { results, skill, roundNet, currency } = props;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(event) => {
        event.stopPropagation();
        props.onDismiss();
      }}
      className="fixed inset-0 z-40 flex cursor-pointer items-center justify-center bg-black/70 p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.7, rotate: -8, y: 24 }}
        animate={{ opacity: 1, scale: 1, rotate: -2, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full max-w-sm rounded-2xl border border-[#d4af37] bg-gradient-to-b from-[#f3ead2] to-[#e8dcc0] px-6 py-7 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.6)]"
      >
        <span className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-black/30 bg-[#4C6FD1] shadow" />

        <p className="text-center text-xs font-bold tracking-[0.2em] text-[#33353D]/70 uppercase">
          The scales have spoken
        </p>

        {results.length === 0 ? (
          <p className="mt-4 text-center text-sm text-[#33353D]/70">
            No bets this round. Just watching.
          </p>
        ) : (
          <div className="mt-4 flex flex-col divide-y divide-black/10">
            {results.map((r) => (
              <div
                key={r.marketId}
                className="flex items-center justify-between gap-2 py-2 first:pt-0 last:pb-0"
              >
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#33353D]">{r.marketLabel}</p>
                  <p className="text-xs text-[#33353D]/60">
                    {r.pickLabel} → {r.outcomeLabel}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <RevealStamp tone={r.won ? 'win' : 'loss'} rotate={r.won ? -3 : 3}>
                    {r.won ? 'Won' : 'Lost'}
                  </RevealStamp>
                  <span
                    className={`text-sm font-bold ${r.net >= 0 ? 'text-[#6BA84F]' : 'text-[#B7410E]'}`}
                  >
                    {r.net >= 0 ? '+' : '−'}
                    {Math.abs(r.net).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-4 flex justify-center border-t border-black/10 pt-3">
            <RevealStamp tone="neutral" rotate={-2}>
              Skill {skill >= 0 ? '+' : '−'}
              {Math.abs(Math.round(skill))} pts
            </RevealStamp>
          </div>
        )}

        <div className="mt-4 border-t border-black/10 pt-4 text-center">
          <p className="text-xs tracking-[0.15em] text-[#33353D]/60 uppercase">This round</p>
          <p
            className={`text-3xl font-black ${roundNet >= 0 ? 'text-[#3FB6A8]' : 'text-[#B7410E]'}`}
          >
            {roundNet >= 0 ? '+' : '−'}
            {Math.abs(roundNet).toFixed(2)} <span className="text-lg">{currency}</span>
          </p>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#33353D]/40">Tap to continue</p>
      </motion.div>
    </motion.div>
  );
};
