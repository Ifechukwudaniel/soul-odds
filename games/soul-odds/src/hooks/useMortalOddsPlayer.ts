"use client";

import { useEffect, useState } from "react";
import { accumulateSkill } from "@/lib/mortal-odds/skill";
import { addPoints, addWinnings, consumeFreeRedraw, getUser } from "@/services/data/user";
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
  freeRedraws: number;
  payRedraw: (fee: number) => "free" | "paid" | null;
  commitRound: (options: { net: number; skill: number; totalStake: number }) => void;
  reset: () => void;
} {
  const balance = useAppStore(state => state.user.balance);
  const skill = useAppStore(state => state.user.skill);
  const address = useAppStore(state => state.user.address);
  /**
   * A round's stake and payout now move for real through `hostApi.openSession`/`submitAction`,
   * so `user.balance` is driven entirely by the host's pushed snapshot (see the balance-sync
   * effect in `page.tsx`) — this delta is only for the local, chain-unaware redraw fee.
   */
  const applyRedrawFeeDelta = useAppStore(state => state.applyBalanceDelta);
  const updateUser = useAppStore(state => state.updateUser);
  const freeRedraws = useAppStore(state => state.user.freeRedraws);
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
   * Pays for a redraw with a banked free redraw when there is one, otherwise with the flat fee.
   * The free redraw is spent optimistically; if the server disagrees, the local count is re-synced from it.
   */
  const payRedraw = (fee: number) => {
    if (freeRedraws > 0) {
      updateUser({ freeRedraws: freeRedraws - 1 });
      consumeFreeRedraw(address).catch(() =>
        getUser(address)
          .then((user) => updateUser({ freeRedraws: user.freeRedraws }))
          .catch((error) => console.error("Could not sync free redraws:", error)),
      );
      return "free";
    }
    return spend(fee) ? "paid" : null;
  };

  /**
   * The round's stake/payout already moved on-chain, so this only accumulates the stats that have
   * no chain equivalent: skill and streaks. The deltas are still computed client-side (not yet
   * validated server-side), but skill is also persisted to the user's DB `points` column and a
   * winning round's net to their lifetime winnings — the columns the leaderboard reads — so both
   * survive a refresh and show up there, instead of living only in this browser's localStorage.
   * A losing round adds nothing to winnings rather than subtracting.
   */
  const commitRound = (options: { net: number; skill: number }) => {
    updateUser({ skill: accumulateSkill(skill, options.skill) });
    if (address && options.skill !== 0) {
      addPoints(address, options.skill).catch((error) => console.error("Could not persist skill points:", error));
    }
    if (address && options.net > 0) {
      addWinnings(address, options.net).catch((error) => console.error("Could not persist winnings:", error));
    }
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
    freeRedraws,
    payRedraw,
    commitRound,
    reset: () => persistRoundStats(DEFAULT_ROUND_STATS),
  };
}
