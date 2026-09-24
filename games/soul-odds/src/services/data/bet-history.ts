import type { BetHistoryEntry } from '@/lib/mortal-odds/bet-history';
import { apiClient } from '@/libs/ApiClient';

export const getBetHistory = async (address: string): Promise<BetHistoryEntry[]> => {
  return (await apiClient.get(`/api/user/${address}/history`)).data;
};

/** Saves settled rounds server-side, so the history follows the wallet across browsers and survives cleared site data. */
export const recordBetHistory = async (
  address: string,
  entries: BetHistoryEntry[],
): Promise<void> => {
  await apiClient.post(`/api/user/${address}/history`, { entries });
};

/** Swaps in the AI-written story and soul name once they land, after the round was first recorded. */
export const patchBetHistoryStory = async (
  address: string,
  patch: Pick<BetHistoryEntry, 'id' | 'story' | 'name'>,
): Promise<void> => {
  await apiClient.patch(`/api/user/${address}/history`, patch);
};
