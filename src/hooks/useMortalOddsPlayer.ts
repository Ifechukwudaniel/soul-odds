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

  const commitRound = (options: { net: number; skill: number }) => {
    persist({
      bankroll: Math.max(0, Math.round((stats.bankroll + options.net) * 100) / 100),
      rounds: stats.rounds + 1,
      bestRound: Math.max(stats.bestRound, options.net),
      streak: options.net > 0 ? stats.streak + 1 : options.net < 0 ? 0 : stats.streak,
      skill: stats.skill + options.skill,
    });
  };

  return { stats, commitRound, reset: () => persist(DEFAULTS) };
}
