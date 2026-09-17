"use client";

import { useEffect, useState } from "react";

export type MortalOddsPlayerStats = { bankroll: number; rounds: number; bestRound: number; streak: number; skill: number };

const START_BANKROLL = 1000;
const STORAGE_KEY = "mortal-odds-player:v1";
const DEFAULTS: MortalOddsPlayerStats = { bankroll: START_BANKROLL, rounds: 0, bestRound: 0, streak: 0, skill: 0 };

function readStats(): MortalOddsPlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** Bankroll and round stats for Mortal Odds, persisted to localStorage like the MVP's own save. */
export function useMortalOddsPlayer(): {
  stats: MortalOddsPlayerStats;
  canAfford: (amount: number) => boolean;
  spend: (amount: number) => boolean;
  commitRound: (options: { net: number; skill: number }) => void;
  reset: () => void;
} {
  const [stats, setStats] = useState<MortalOddsPlayerStats>(DEFAULTS);

  useEffect(() => {
    setStats(readStats());
  }, []);

  const persist = (next: MortalOddsPlayerStats) => {
    setStats(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable: play continues in memory */
    }
  };

  const canAfford = (amount: number) => stats.bankroll >= amount;

  /** Charges a step of the round. Returns false and leaves the bankroll alone when the player is short. */
  const spend = (amount: number) => {
    if (!canAfford(amount)) {
      return false;
    }
    persist({ ...stats, bankroll: Math.round((stats.bankroll - amount) * 100) / 100 });
    return true;
  };

  const commitRound = (options: { net: number; skill: number }) => {
    persist({
      bankroll: Math.max(0, Math.round((stats.bankroll + options.net) * 100) / 100),
      rounds: stats.rounds + 1,
      bestRound: Math.max(stats.bestRound, options.net),
      streak: options.net > 0 ? stats.streak + 1 : options.net < 0 ? 0 : stats.streak,
      skill: stats.skill + options.skill,
    });
  };

  return { stats, canAfford, spend, commitRound, reset: () => persist(DEFAULTS) };
}
