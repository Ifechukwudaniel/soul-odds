'use client';

import { MotionConfig } from 'framer-motion';
import { useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { BetPanel } from '@/components/game/home/BetPanel';
import { GameCard } from '@/components/game/home/GameCard';
import { SlipBar, SlipSheetHandle } from '@/components/game/home/SlipBar';
import { DrawSequence } from '@/components/game/mortal-odds/stage/draw/DrawSequence';
import { DrawHero } from '@/components/game/mortal-odds/stage/DrawHero';
import { PredictionsPanel } from '@/components/game/mortal-odds/stage/markets/PredictionsPanel';
import { RevealPanel } from '@/components/game/mortal-odds/stage/reveal/RevealPanel';
import { BetSummary } from '@/components/game/mortal-odds/stage/summary/BetSummary';
import { useClientMediaQuery } from '@/hooks/useClientMediaQuery';
import type { MortalOddsBets } from '@/hooks/useMortalOddsBets';
import type { MortalOddsRound } from '@/hooks/useMortalOddsDraw';
import { slipTotals } from '@/lib/mortal-odds/bets';
import { marketsConfig } from '@/lib/mortal-odds/config';
import type { MarketPrices, Price, RoundCharge } from '@/types';

export const MortalOddsStage = (props: {
  round: MortalOddsRound;
  bets: MortalOddsBets['bets'];
  chipSize: number;
  currency: string;
  onDraw: () => void;
  onSetChoice: MortalOddsBets['setChoice'];
  onPlaceBet: () => void;
  onRevealLocation: () => void;
  onRedrawLocation: () => void;
  drawCost: number;
  canAffordDraw: boolean;
  /** True only when the balance can't cover the draw; unlike `canAffordDraw` it ignores a session that is still opening. */
  insufficientFunds: boolean;
  charges: RoundCharge[];
  quickAmounts: number[];
  onSelectChip: (amount: number) => void;
  chipLocked: boolean;
  prices: MarketPrices | null;
  priceDeathYear: (guessYear: number) => Price;
  onRemoveBet: MortalOddsBets['remove'];
}) => {
  const { round } = props;
  const [slipOpen, setSlipOpen] = useState(false);
  const slipId = useId();
  const totals = slipTotals({
    bets: props.bets,
    prices: props.prices,
    priceDeathYear: props.priceDeathYear,
    charges: props.charges,
    requiredBets: marketsConfig.length,
  });
  const inDrawSequence =
    round.phase === 'drawing' || round.phase === 'when' || round.phase === 'where';

  // ✦ Phones: the wager panel is a bottom sheet opened from the slip bar; lg+: the side panel. On phones it is
  //   portalled to <body>, so no scroll container or stacking context can trap or clip it, and it sits above the nav.
  const phoneSheet = useClientMediaQuery('(max-width: 1023.98px)');
  const slipLayers = (
    <>
      {slipOpen && (
        <button
          type="button"
          aria-label="Close wager slip"
          onClick={() => setSlipOpen(false)}
          className="fixed inset-0 z-[59] cursor-default bg-black/60 lg:hidden"
        />
      )}
      <div
        id={slipId}
        className={`order-last shrink-0 motion-reduce:transition-none max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-[60] max-lg:max-h-[80dvh] max-lg:overflow-y-auto max-lg:overscroll-contain max-lg:rounded-t-2xl max-lg:bg-[#0b1512] max-lg:p-2 max-lg:pb-[max(0.5rem,env(safe-area-inset-bottom))] max-lg:shadow-[0_-12px_40px_rgba(0,0,0,0.6)] max-lg:transition-[transform,visibility] max-lg:duration-200 lg:order-first lg:h-full lg:w-80 ${slipOpen ? '' : 'max-lg:invisible max-lg:translate-y-full'}`}
      >
        <SlipSheetHandle onClose={() => setSlipOpen(false)} />
        <BetPanel
          currency={props.currency}
          chipSize={props.chipSize}
          quickAmounts={props.quickAmounts}
          onSelectChip={props.onSelectChip}
          chipLocked={props.chipLocked}
          bets={props.bets}
          prices={props.prices}
          priceDeathYear={props.priceDeathYear}
          onRemoveBet={props.onRemoveBet}
          charges={props.charges}
          onPlaceBet={round.advance}
          canPlaceBet={round.phase === 'predicting'}
          isLocked={round.phase === 'confirming' || round.phase === 'settling'}
          requiredBets={marketsConfig.length}
          sinNarratives={round.sinNarratives}
        />
      </div>
    </>
  );

  return (
    <MotionConfig reducedMotion="user">
      <div
        className="flex w-full flex-1 flex-col gap-4 max-lg:min-h-0 max-lg:gap-2 lg:h-[min(calc(100dvh-14rem),44rem)] lg:flex-row"
        aria-live="polite"
      >
        {phoneSheet ? createPortal(slipLayers, document.body) : slipLayers}

        <div className="flex min-w-0 flex-1 flex-col max-lg:min-h-0 lg:h-full">
          {round.phase === 'idle' && (
            <DrawHero
              currentYear={round.currentYear}
              onDraw={props.onDraw}
              drawCost={props.drawCost}
              canAfford={props.canAffordDraw}
              insufficientFunds={props.insufficientFunds}
              currency={props.currency}
            />
          )}

          {inDrawSequence && round.draw && round.context && (
            <DrawSequence
              draw={round.draw}
              context={round.context}
              displayYear={round.displayYear}
              isSpinning={round.phase === 'drawing'}
              currentYear={round.currentYear}
              step={round.phase === 'where' ? 'where' : 'when'}
              onAdvance={round.phase === 'when' ? props.onRevealLocation : round.advance}
              onRetreat={round.retreat}
              onRedraw={props.onDraw}
              onRedrawLocation={props.onRedrawLocation}
              drawCost={props.drawCost}
              canAffordDraw={props.canAffordDraw}
              currency={props.currency}
            />
          )}

          {round.phase === 'predicting' && round.draw && props.prices && (
            <PredictionsPanel
              prices={props.prices}
              chipSize={props.chipSize}
              bets={props.bets}
              onSetChoice={props.onSetChoice}
              onBack={round.retreat}
              onPlaceBet={round.advance}
              sinNarratives={round.sinNarratives}
              key={`${round.draw.year}-${round.draw.region}-${round.draw.place.name}`}
            />
          )}

          {round.phase === 'confirming' && round.draw && props.prices && (
            <BetSummary
              draw={round.draw}
              bets={props.bets}
              prices={props.prices}
              priceDeathYear={round.priceDeathYear}
              charges={props.charges}
              currency={props.currency}
              onBack={round.retreat}
              onConfirm={props.onPlaceBet}
              sinNarratives={round.sinNarratives}
            />
          )}

          {round.phase === 'settling' && (
            <GameCard
              className="flex min-h-0 flex-1 items-center justify-center"
              containerClassName="flex h-full w-full flex-col"
            >
              <div className="story-loading" aria-label="Writing this soul's story…" role="status">
                <div className="story-loading__bar">
                  <div className="story-loading__fill" />
                  <div className="story-loading__shine" />
                </div>

                <span className="story-loading__text">
                  {round.awaitingSinNarrative
                    ? 'Consulting the record of sins…'
                    : 'Reading the omens…'}
                </span>
              </div>
            </GameCard>
          )}

          {round.phase === 'revealed' && round.reveal && round.draw && (
            <RevealPanel
              reveal={round.reveal}
              place={round.draw.place}
              currentYear={round.currentYear}
              currency={props.currency}
              charges={props.charges}
              onNext={props.onDraw}
              drawCost={props.drawCost}
              canAffordDraw={props.canAffordDraw}
              sessionKey={round.sessionKey}
            />
          )}
        </div>

        <SlipBar
          stake={props.chipLocked ? totals.atRisk : props.chipSize}
          potentialWin={totals.totalPotentialWin}
          pickCount={totals.bets.length}
          requiredBets={marketsConfig.length}
          currency={props.currency}
          isOpen={slipOpen}
          controlsId={slipId}
          onToggle={() => setSlipOpen(!slipOpen)}
        />
      </div>
    </MotionConfig>
  );
};
