import { apiClient } from '@/libs/ApiClient';
import type { LeaderboardSort, User } from '@/services/db/user';

type GetLeaderboardOptions = {
  sortBy?: LeaderboardSort;
  /** The current user's address, if connected - guarantees they're included even outside the ranked range. */
  address?: string;
};

export const getLeaderboard = async (options?: GetLeaderboardOptions): Promise<User[]> => {
  try {
    const params = new URLSearchParams({ sortBy: options?.sortBy ?? 'points' });
    if (options?.address) params.set('address', options.address);

    const users = (await apiClient.get(`/api/leaderboard?${params.toString()}`)).data as User[];
    return users;
  } catch (error) {
    console.error(error);
    throw new Error('Could not get leaderboard');
  }
};
