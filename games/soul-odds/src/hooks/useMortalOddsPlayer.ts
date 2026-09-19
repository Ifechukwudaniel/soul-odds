"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/services/store/store";

export type MortalOddsPlayerStats = { bankroll: number; rounds: number; bestRound: number; streak: number; skill: number };

type RoundStats = Omit<MortalOddsPlayerStats, "bankroll">;

const STORAGE_KEY = "mortal-odds-player:v1";
const DEFAULT_ROUND_STATS: RoundStats = { rounds: 0, bestRound: 0, streak: 0, skill: 0 };

function readRoundStats(): RoundStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_ROUND_STATS, ...JSON.parse(raw) } : DEFAULT_ROUND_STATS;
  } catch {
    return DEFAULT_ROUND_STATS;
  }
}

/** Round stats for Mortal Odds, persisted to localStorage; bankroll is the app store's user balance. */
export function useMortalOddsPlayer(): {
  stats: MortalOddsPlayerStats;
  canAfford: (amount: number) => boolean;
  spend: (amount: number) => boolean;
  commitRound: (options: { net: number; skill: number }) => void;
  reset: () => void;
} {
  const balance = useAppStore(state => state.user.balance);
  const applyBalanceDelta = useAppStore(state => state.applyBalanceDelta);
  const [roundStats, setRoundStats] = useState<RoundStats>(DEFAULT_ROUND_STATS);

  useEffect(() => {
    setRoundStats(readRoundStats());
  }, []);

  const persistRoundStats = (next: RoundStats) => {
    setRoundStats(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: round stats continue in memory */
    }
  };

  const canAfford = (amount: number) => balance >= amount;

  /** Charges a step of the round. Returns false and leaves the balance alone when the player is short. */
  const spend = (amount: number) => {
    if (!canAfford(amount)) {
      return false;
    }
    applyBalanceDelta(-amount);
    return true;
  };

  const commitRound = (options: { net: number; skill: number }) => {
    applyBalanceDelta(options.net);
    persistRoundStats({
      rounds: roundStats.rounds + 1,
      bestRound: Math.max(roundStats.bestRound, options.net),
      streak: options.net > 0 ? roundStats.streak + 1 : options.net < 0 ? 0 : roundStats.streak,
      skill: roundStats.skill + options.skill,
    });
  };

  return {
    stats: { bankroll: balance, ...roundStats },
    canAfford,
    spend,
    commitRound,
    reset: () => persistRoundStats(DEFAULT_ROUND_STATS),
  };
}
