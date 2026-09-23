import { apiClient } from "@/libs/ApiClient";
import { User } from "@/services/db/user";


export const getUser = async (address:string) :Promise<User>=> {
  try {
    let user = (await apiClient.get(`/api/user/${address}`)).data as User;
    return user
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};

/**
 * Registers a user for the given wallet address if one doesn't already exist,
 * seeding or syncing their balance to the wallet's real balance either way.
 * @param address The connected wallet address.
 * @param referredBy The referring user's address, if any.
 * @param balance The wallet's current balance, used as the starting balance on
 * create and re-synced on every call so a returning user's balance never
 * drifts from their wallet.
 */
export const registerUser = async (address: string, referredBy?: string, balance?: number): Promise<void> => {
  try {
    await apiClient.post("/api/user", { address, referredBy, balance });
  } catch (error) {
    console.error(error);
    throw new Error("Could not register user");
  }
};

/** Adds `delta` to a user's leaderboard score (points), server-side, so it survives a refresh and can't be spoofed by editing local state. */
export const addPoints = async (address: string, delta: number): Promise<void> => {
  await apiClient.post(`/api/user/${address}/points`, { delta });
};

/** Spends one of the user's free redraws server-side. Rejects when none are left. */
export const consumeFreeRedraw = async (address: string): Promise<{ freeRedraws: number }> => {
  return (await apiClient.post(`/api/user/${address}/free-redraw`)).data;
};
