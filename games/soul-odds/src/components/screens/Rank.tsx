"use client";

import { useEffect, useState } from "react";
import { Loader } from "../Loader";
import { Leaderboard } from "@/components/game/leaderboard/Leaderboard";
import { RefeshInterval } from "@/constants";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { getLeaderboard } from "@/services/data/leaderboard";
import type { User } from "@/services/db/user";
import { useAppStore } from "@/services/store/store";
import type { LeaderboardUser } from "@/types";
import { formatAddress } from "@/utils";

const RESET_AT = new Date("2026-09-28T00:00:00Z");

function toLeaderboardUser(user: User, rank: number): LeaderboardUser {
  const displayName = user.username || formatAddress(user.address);
  return {
    id: user.address,
    rank,
    username: displayName,
    handle: displayName.toLowerCase(),
    followers: 0,
    points: user.points,
    reward: 0,
  };
}

export const RankScreen = () => {
  const address = useAppStore((state) => state.user.address);
  const { stats } = useMortalOddsPlayer();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    try {
      const rankedUsers = await getLeaderboard({ sortBy: "points", address: address || undefined });
      setUsers(rankedUsers.map((user, index) => toLeaderboardUser(user, index + 1)));
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, RefeshInterval);
    return () => clearInterval(interval);
  }, [address]);

  if (loading) {
    return (
      <section className="flex flex-col h-screen justify-center items-center">
        <Loader />
      </section>
    );
  }

  // `reward` is the leaderboard's "Winnings" column - the server doesn't track it per
  // user yet, so only the current user's row gets a real figure, from local round stats.
  const rankedUsers = users.map((entry) =>
    entry.id === address ? { ...entry, reward: Math.round(stats.totalWinnings) } : entry
  );
  const currentUser = rankedUsers.find((entry) => entry.id === address);

  return <Leaderboard users={rankedUsers} currentUser={currentUser} resetAt={RESET_AT} />;
};
