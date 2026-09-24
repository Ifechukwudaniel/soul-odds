'use client';

import { useEffect, useState } from 'react';
import { Leaderboard } from '@/components/game/leaderboard/Leaderboard';
import { getLeaderboard } from '@/services/data/leaderboard';
import type { User } from '@/services/db/user';
import { useAppStore } from '@/services/store/store';
import type { LeaderboardUser } from '@/types';
import { formatAddress } from '@/utils';
import { Loader } from '../Loader';

const RESET_AT = new Date('2026-09-28T00:00:00Z');

function toLeaderboardUser(user: User, rank: number): LeaderboardUser {
  const displayName = user.username || formatAddress(user.address);
  return {
    id: user.address,
    rank,
    username: displayName,
    handle: displayName.toLowerCase(),
    followers: 0,
    points: user.points,
    reward: Math.round(user.totalProfit),
  };
}

export const RankScreen = () => {
  const address = useAppStore((state) => state.user.address);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getLeaderboard({ sortBy: 'points', address: address || undefined })
      .then((rankedUsers) =>
        setUsers(rankedUsers.map((user, index) => toLeaderboardUser(user, index + 1))),
      )
      .catch((error) => console.error('Failed to fetch leaderboard', error))
      .finally(() => setLoading(false));
  }, [address]);

  if (loading) {
    return <Loader className="h-full" />;
  }

  const currentUser = users.find((entry) => entry.id === address);

  return <Leaderboard users={users} currentUser={currentUser} resetAt={RESET_AT} />;
};
