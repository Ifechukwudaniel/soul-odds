"use client";

import { useEffect, useState } from "react";
import { accumulateSkill } from "@/lib/mortal-odds/skill";
import { useAppStore } from "@/services/store/store";

export type MortalOddsPlayerStats = { bankroll: number; rounds: number; bestRound: number; streak: number; skill: number; totalWinnings: number };

type RoundStats = Omit<MortalOddsPlayerStats, "bankroll" | "skill">;

const STORAGE_KEY = "mortal-odds-player:v1";
const DEFAULT_ROUND_STATS: RoundStats = { rounds: 0, bestRound: 0, streak: 0, totalWinnings: 0 };

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
   * A round's stake and payout now move for real through `hostApi.openSession`/`submitAction`,
   * so `user.balance` is driven entirely by the host's pushed snapshot (see the balance-sync
   * effect in `page.tsx`) — this delta is only for the local, chain-unaware redraw fee.
   */
  const applyRedrawFeeDelta = useAppStore(state => state.applyBalanceDelta);
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

  /** Charges a local, chain-unaware fee (a redraw). Returns false and leaves the balance alone when the player is short. */
  const spend = (amount: number) => {
    if (!canAfford(amount)) {
      return false;
    }
    applyRedrawFeeDelta(-amount);
    return true;
  };

  /**
   * The round's stake/payout already moved on-chain, so this only accumulates the stats that have
   * no chain equivalent: skill and streaks. Skill is still spoofable client-side until it moves
   * server-side, but the balance itself is no longer at risk from that.
   */
  const commitRound = (options: { net: number; skill: number }) => {
    updateUser({ skill: accumulateSkill(skill, options.skill) });
    persistRoundStats({
      rounds: roundStats.rounds + 1,
      bestRound: Math.max(roundStats.bestRound, options.net),
      streak: options.net > 0 ? roundStats.streak + 1 : options.net < 0 ? 0 : roundStats.streak,
      // A losing round adds nothing here rather than subtracting — this is a lifetime "how much have
      // you won" tally for the leaderboard, not a profit/loss running total (see LeaderboardTable.tsx).
      totalWinnings: roundStats.totalWinnings + Math.max(0, options.net),
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
