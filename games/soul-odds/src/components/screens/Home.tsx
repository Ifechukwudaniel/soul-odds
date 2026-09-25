'use client';

import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MortalOddsStage } from '@/components/game/mortal-odds/MortalOddsStage';
import { useMortalOddsBets } from '@/hooks/useMortalOddsBets';
import { useMortalOddsDraw } from '@/hooks/useMortalOddsDraw';
import type { useMortalOddsPlayer } from '@/hooks/useMortalOddsPlayer';
import { useRoundResume } from '@/hooks/useRoundResume';
import { toHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { CHIP_SIZES, REDRAW_COST } from '@/lib/mortal-odds/config';
import { ageBucketIndex } from '@/lib/mortal-odds/soul-odds-contract';
import { recordBetHistory } from '@/services/data/bet-history';
import { useAppStore } from '@/services/store/store';
import type { MarketPrices, RoundCharge } from '@/types';
import { notification } from '@/utils/notifications';
import { useCasinoHost } from '@/hooks/useCasinoHost';



export const HomeScreen = (props: { player: ReturnType<typeof useMortalOddsPlayer> }) => {
  // =====================================
  // ⬢ State
  // =====================================
  const {  snapshot } = useCasinoHost();
  const [chipSize, setChipSize] = useState(10);
  const CURRENCY = snapshot?.token.symbol || 'chUSD';
  const [charges, setCharges] = useState<RoundCharge[]>([]);

  const reducedMotion = useReducedMotion() ?? false;
  const round = useMortalOddsDraw({ reducedMotion });
  const slip = useMortalOddsBets();
  const { player } = props;
  const address = useAppStore((state) => state.user.address);
  const { restoredReveal } = useRoundResume({
    round,
    slip,
    charges,
    setCharges,
    chipSize,
    setChipSize,
  });

  // =====================================
  // ⬢ Derived state
  // =====================================

  // ✦ Chip size is the round's whole stake: locked the moment a soul is summoned, freed up again once it's revealed.
  const chipLocked = round.phase !== 'idle' && round.phase !== 'revealed';
  const isRedraw = round.phase === 'when' || round.phase === 'where';
  const drawCost = isRedraw ? (player.freeRedraws > 0 ? 0 : REDRAW_COST) : chipSize;

  // =====================================
  // ⬢ Handlers
  // =====================================

  // ✦ Pays for a redraw with a free redraw if one is banked (no charge line), otherwise the flat fee.
  const payRedraw = () => {
    const paid = player.payRedraw(REDRAW_COST);
    if (paid === 'paid') {
      setCharges([
        ...charges,
        { id: `redraw-${charges.length}`, label: 'Redraw', amount: REDRAW_COST, kind: 'fee' },
      ]);
    }
    return paid !== null;
  };

  // ✦ A redraw is a local, chain-unaware fee; the stake moves on-chain when `round.drawHuman` escrows
  //   it, so only affordability is checked here.
  const onDraw = () => {
    if (isRedraw) {
      if (!payRedraw()) return;
    } else {
      if (!player.canAfford(chipSize)) return;
      setCharges([{ id: 'stake', label: 'Stake', amount: chipSize, kind: 'stake' }]);
      slip.reset();
    }
    round.drawHuman(chipSize);
  };

  const onRevealLocation = () => {
    round.advance();
  };

  // ✦ Holds the year fixed and only rerolls the land, for the same flat fee as a redraw.
  const onRedrawLocation = () => {
    if (!payRedraw()) return;
    round.redrawLocation();
  };

  const onPlaceBet = () => {
    round.placeBets(slip.bets);
  };

  // =====================================
  // ⬢ Odds
  // =====================================

  // ✦ Crime odds depend on the age bucket the player paired them with, so the draw-time preview
  //   (priced against a placeholder bucket) is replaced once the age bet is known.
  const ageBet = slip.bets.age;
  const prices: MarketPrices | null =
    round.prices && ageBet?.kind === 'choice'
      ? { ...round.prices, sins: round.priceSins(ageBucketIndex(ageBet.optionId)) }
      : round.prices;

  // =====================================
  // ⬢ Effects
  // =====================================

  // ✦ The round settles asynchronously on-chain; commit the local skill/streak stats when its outcome
  //   returns.
  useEffect(() => {
    if (!round.reveal || round.reveal === restoredReveal) return;
    player.commitRound({
      net: round.reveal.net,
      skill: round.reveal.skill,
      totalStake: 0,
    });
    if (address && round.sessionKey && round.draw) {
      const entry = toHistoryEntry({
        sessionKey: round.sessionKey,
        reveal: round.reveal,
        draw: round.draw,
        charges,
        settledAt: Date.now(),
      });
      recordBetHistory(address, [entry]).catch((error) =>
        console.error('Could not save the round to history:', error),
      );
    }
    slip.reset();
  }, [round.reveal]);

  useEffect(() => {
    if (round.error) notification.error(round.error);
  }, [round.error]);

  // =====================================
  // ⬢ Render
  // =====================================
  return (
    <div className="flex h-full w-full flex-col">
      <div className="container mx-auto flex flex-1 flex-col gap-4 max-lg:min-h-0 px-3 pb-2 md:px-4 md:pb-[10dvh] lg:flex-row">
        <MortalOddsStage
          round={round}
          bets={slip.bets}
          chipSize={chipSize}
          currency={CURRENCY}
          onDraw={onDraw}
          onSetChoice={slip.setChoice}
          onPlaceBet={onPlaceBet}
          onRevealLocation={onRevealLocation}
          onRedrawLocation={onRedrawLocation}
          drawCost={drawCost}
          canAffordDraw={player.canAfford(drawCost) && !round.isOpeningSession}
          insufficientFunds={!player.canAfford(drawCost)}
          charges={charges}
          quickAmounts={CHIP_SIZES}
          onSelectChip={setChipSize}
          chipLocked={chipLocked}
          prices={prices}
          priceDeathYear={round.priceDeathYear}
          onRemoveBet={slip.remove}
        />
      </div>
    </div>
  );
};
