"use client";

import { useEffect, useState } from "react";
import { useCasinoHost } from "@/hooks/useCasinoHost";
import { notification } from "@/utils/notifications";
import type { MortalOddsBets } from "@/hooks/useMortalOddsBets";
import type { MortalOddsRound, RevealResult } from "@/hooks/useMortalOddsDraw";
import { clearRound, readRound, roundStorageKey, toResumablePhase, writeRound } from "@/lib/mortal-odds/round-storage";
import type { RoundCharge } from "@/types";


export function useRoundResume(options: {
  round: MortalOddsRound;
  slip: MortalOddsBets;
  charges: RoundCharge[];
  setCharges: (charges: RoundCharge[]) => void;
  chipSize: number;
  setChipSize: (chipSize: number) => void;
}): { restoredReveal: RevealResult | null } {
  const { round, slip, charges, setCharges, chipSize, setChipSize } = options;
  const { snapshot } = useCasinoHost();
  const key = snapshot ? roundStorageKey(snapshot) : null;
  const [checked, setChecked] = useState(false);
  const [restoredReveal, setRestoredReveal] = useState<RevealResult | null>(null);

  useEffect(() => {
    if (!key || checked) return;
    const stored = readRound(key);
    if (stored) {
      void round.restore(stored);
      slip.replace(stored.bets);
      setCharges(stored.charges);
      setChipSize(stored.chipSize);
      setRestoredReveal(stored.reveal);
      notification.info(stored.phase === "revealed" ? "Here's how your last soul turned out." : "Picking up your round in progress — your wager is safe.");
    }
    setChecked(true);
  }, [key, checked]);

  useEffect(() => {
    if (!key || !checked) return;
    const phase = toResumablePhase(round.phase);
    if (!phase || !round.sessionKey || !round.wagerWei || !round.draw || !round.context || round.samplesSeed === null) {
      clearRound(key);
      return;
    }
    writeRound(key, {
      version: 1,
      sessionKey: round.sessionKey,
      wagerWei: round.wagerWei,
      phase,
      era: round.era,
      draw: round.draw,
      story: round.context.story,
      samplesSeed: round.samplesSeed,
      bets: slip.bets,
      charges,
      chipSize,
      configurationIndex: round.configurationIndex,
      reveal: round.reveal,
    });
  }, [key, checked, round.phase, round.sessionKey, round.wagerWei, round.draw, round.context, round.samplesSeed, round.era, round.configurationIndex, round.reveal, slip.bets, charges, chipSize]);

  return { restoredReveal };
}
