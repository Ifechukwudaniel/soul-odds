'use client';

import { useId } from 'react';
import { GameDialog } from '@/components/game/GameDialog';
import { ModalCloseButton, ModalHeader } from '@/components/game/GameModalParts';
import {
  fmtSettledAt,
  fmtSigned,
  isStillLiving,
  soulLabel,
} from '@/components/game/history/format';
import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { fmtYear } from '@/lib/mortal-odds/format';
import { serifFont } from '@/styles/serif-font';

const SECTION =
  'flex flex-col gap-3 rounded-xl border border-[#d4af37]/25 bg-[#F5B83D]/5 px-4 py-3';

const Section = (props: { title: string; children: React.ReactNode }) => (
  <section className={SECTION}>
    <h3
      className={`${serifFont.className} text-xs font-bold tracking-[0.12em] text-[#F3D38F] uppercase`}
    >
      {props.title}
    </h3>
    {props.children}
  </section>
);

const Row = (props: { label: string; value: string; valueClass?: string }) => (
  <div className="flex items-center justify-between gap-3">
    <dt className="text-[11px] tracking-[0.15em] text-white/50 uppercase">{props.label}</dt>
    <dd className={`text-right text-xs text-white ${props.valueClass ?? ''}`}>{props.value}</dd>
  </div>
);

function lifespanLabel(entry: BetHistoryEntry): string {
  if (isStillLiving(entry)) return 'Still living';
  if (entry.age === 0) return 'Under a year';
  return entry.age === 1 ? '1 year' : `${entry.age} years`;
}

/** Everything kept about one settled round: the soul and its story, each bet, and where the money went. */
export const HistoryRoundModal = (props: { entry: BetHistoryEntry; onClose: () => void }) => {
  const { entry } = props;
  const titleId = useId();

  return (
    <GameDialog isOpen onClose={props.onClose} labelledBy={titleId} className="w-full max-w-lg">
      <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-y-auto rounded-2xl p-6 text-left">
        <ModalCloseButton onClick={props.onClose} />

        <ModalHeader
          title={soulLabel(entry)}
          titleId={titleId}
          intro={fmtSettledAt(entry.settledAt)}
        />

        <Section title="Soul record">
          <dl className="flex flex-col gap-2">
            <Row label="Born" value={fmtYear(entry.bornYear)} />
            <Row
              label={isStillLiving(entry) ? 'Projected death' : 'Died'}
              value={fmtYear(entry.deathYear)}
            />
            <Row label="Lifespan" value={lifespanLabel(entry)} />
            <Row label="Sin" value={entry.sin ?? 'Clean'} />
          </dl>
        </Section>

        {entry.story && (
          <Section title="Their story">
            <div className="flex flex-col gap-3 text-sm leading-relaxed text-white/90">
              {entry.story.split('\n\n').map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Section>
        )}

        <Section title="Your bets">
          {entry.bets.length === 0 ? (
            <p className="text-sm text-white/50">No bets this round. Just watching.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              {entry.bets.map((bet) => (
                <div
                  key={bet.marketId}
                  className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-[600] text-white">{bet.marketLabel}</p>
                    <p className="truncate text-xs text-white/50">
                      {bet.pickLabel} → {bet.outcomeLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-right">
                    <div>
                      <p className="text-xs font-[600] text-[#F5B83D]">×{bet.odds.toFixed(2)}</p>
                      <p className="text-[11px] text-white/40">stake {bet.stake.toFixed(2)}</p>
                    </div>
                    <p
                      className={`w-16 text-sm font-bold ${bet.won ? 'text-[#6BA84F]' : 'text-[#B7410E]'}`}
                    >
                      {fmtSigned(bet.net)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="The ledger">
          <dl className="flex flex-col gap-2">
            <Row label="Wager locked" value={entry.wager.toFixed(2)} />
            <Row
              label="Bets returned"
              value={fmtSigned(entry.net)}
              valueClass={entry.net >= 0 ? 'text-[#6BA84F]' : 'text-[#B7410E]'}
            />
            <Row
              label="Paid to the scribe"
              value={entry.fees > 0 ? `−${entry.fees.toFixed(2)}` : 'None'}
              valueClass={entry.fees > 0 ? 'text-[#F5B83D]' : undefined}
            />
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
              <dt className="text-sm font-[600] text-white">This round</dt>
              <dd
                className={`text-lg font-bold ${entry.roundNet >= 0 ? 'text-[#6BA84F]' : 'text-[#B7410E]'}`}
              >
                {fmtSigned(entry.roundNet)}
              </dd>
            </div>
          </dl>
        </Section>

        <p className="text-center text-[11px] text-white/30">Round #{entry.id.slice(-6)}</p>
      </div>
    </GameDialog>
  );
};
