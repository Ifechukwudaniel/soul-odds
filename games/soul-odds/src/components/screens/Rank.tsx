"use client";

import { Leaderboard } from "@/components/game/leaderboard/Leaderboard";
import { useMortalOddsPlayer } from "@/hooks/useMortalOddsPlayer";
import { useAppStore } from "@/services/store/store";
import type { LeaderboardUser } from "@/types";

const RESET_AT = new Date("2026-09-28T00:00:00Z");

/** Placeholder competitors until a real leaderboard endpoint exists; the current user is merged in below. */
const MOCK_USERS: LeaderboardUser[] = [
  { id: "1", rank: 1, username: "Jolie Joie", handle: "joliejoie", followers: 40200, points: 2_500_000, reward: 100_000 },
  { id: "2", rank: 2, username: "Brian Ngo", handle: "brianngo", followers: 31000, points: 2_200_000, reward: 50_000 },
  { id: "3", rank: 3, username: "David Do", handle: "davidgo", followers: 28500, points: 2_100_000, reward: 20_000 },
  { id: "4", rank: 4, username: "Henrietta O'Connell", handle: "henrietta", followers: 12241, points: 2_114_424, reward: 1000 },
  { id: "5", rank: 5, username: "Darrel Bins", handle: "darrel", followers: 12241, points: 2_114_424, reward: 1000 },
];

export const RankScreen = () => {
  const user = useAppStore((state) => state.user);
  const { stats } = useMortalOddsPlayer();

  const currentUserId = user.address;
  const currentUserEntry: LeaderboardUser = {
    id: currentUserId,
    rank: 0,
    username: user.username || "You",
    handle: (user.username || "you").toLowerCase(),
    followers: 0,
    points: Math.round(user.skill),
    // `reward` is the leaderboard's "Winnings" column — a lifetime total, not a profit/loss figure.
    reward: Math.round(stats.totalWinnings),
  };

  // Rank is derived from sorted position, not stored, so the current user always lands where their real points put them.
  const users = [...MOCK_USERS.filter((entry) => entry.id !== currentUserId), currentUserEntry]
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const currentUser = users.find((entry) => entry.id === currentUserId);

  return <Leaderboard users={users} currentUser={currentUser} resetAt={RESET_AT} />;
};
