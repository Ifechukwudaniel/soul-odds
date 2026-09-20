"use client";

import { useEffect, useState } from "react";
import { accumulateSkill } from "@/lib/mortal-odds/skill";
import { useAppStore } from "@/services/store/store";

export type MortalOddsPlayerStats = { bankroll: number; rounds: number; bestRound: number; streak: number; skill: number };

type RoundStats = Omit<MortalOddsPlayerStats, "bankroll" | "skill">;

const STORAGE_KEY = "mortal-odds-player:v1";
const DEFAULT_ROUND_STATS: RoundStats = { rounds: 0, bestRound: 0, streak: 0 };

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
  commitRound: (options: { net: number; skill: number; totalStake: number }) => void;
  reset: () => void;
} {
  const balance = useAppStore(state => state.user.balance);
  const skill = useAppStore(state => state.user.skill);
  /**
   * TEMPORARY: rounds still settle synchronously on the client (no real on-chain
   * session yet), so spend/commitRound optimistically mutate the store's balance
   * directly. Once rounds settle via `hostApi.openSession`/`submitAction`, delete
   * this local mutation path entirely and let the host's pushed snapshot drive
   * `user.balance` instead (see the balance-sync effect in `page.tsx`).
   */
  const applyOptimisticBalanceDelta = useAppStore(state => state.applyBalanceDelta);
  const updateUser = useAppStore(state => state.updateUser);
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
    applyOptimisticBalanceDelta(-amount);
    return true;
  };

  /** The stake was already spent up front via `spend`, so only the payout (stake + net) comes back; net itself still drives stats. */
  const commitRound = (options: { net: number; skill: number; totalStake: number }) => {
    applyOptimisticBalanceDelta(options.net + options.totalStake);
    // TEMPORARY: same local-mutation caveat as balance above — once rounds settle
    // server-side, skill should accumulate there so it can't be spoofed client-side.
    updateUser({ skill: accumulateSkill(skill, options.skill) });
    persistRoundStats({
      rounds: roundStats.rounds + 1,
      bestRound: Math.max(roundStats.bestRound, options.net),
      streak: options.net > 0 ? roundStats.streak + 1 : options.net < 0 ? 0 : roundStats.streak,
    });
  };

  return {
    stats: { bankroll: balance, skill, ...roundStats },
    canAfford,
    spend,
    commitRound,
    reset: () => persistRoundStats(DEFAULT_ROUND_STATS),
  };
}
