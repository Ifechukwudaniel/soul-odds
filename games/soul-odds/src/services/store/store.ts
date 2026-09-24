import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { DEFAULT_AVATAR_ID } from '@/components/assets/characters/avatars';

export type TScreens =
  | 'badges'
  | 'history'
  | 'home'
  | 'refs'
  | 'stats'
  | 'quests'
  | 'social'
  | 'wallet'
  | 'ranks';

export type TScreenPayload = {
  data?: string;
};

export type TUser = {
  address: string;
  username: string;
  balance: number;
  rank: number;
  skill: number;
  connectionId: string;
  avatarId: string;
  freeRedraws: number;
};

export const STORE_NAME = 'Soul_Odds_Store';

export const hasState = () => {
  return typeof window === 'undefined' ? false : localStorage.getItem(STORE_NAME) !== null;
};

export const emptyUser: TUser = {
  address: '',
  username: '',
  balance: 1000,
  rank: 0,
  skill: 0,
  connectionId: '',
  avatarId: DEFAULT_AVATAR_ID,
  freeRedraws: 0,
};

export type TAppStore = {
  hasData: boolean;
  defaultData: boolean;
  screen: TScreens;
  user: TUser;
  wallet: string;
  walletClaimed: boolean;
  setScreen: (newValue: TScreens, payload?: TScreenPayload | null) => void;
  updateBalance: (newBalance: number) => void;
  applyBalanceDelta: (delta: number) => void;
  updateUser: (updatedFields: Partial<TUser>) => void;
  updateDefaultData: () => void;
  claimRank: (rankId: number) => void;
  resetState: () => void;
};

export const initialState = {
  hasData: false,
  defaultData: true,
  screen: 'home' as TScreens,
  user: emptyUser,
  wallet: '',
  walletClaimed: false,
};

export const useAppStore = create<TAppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        setScreen: (newValue: TScreens, payload: TScreenPayload | null | undefined): void =>
          set(() => ({ screen: newValue, screenPayload: payload })),
        updateBalance: (newBalance: number): void => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              balance: newBalance,
            },
          }));
        },
        applyBalanceDelta: (delta: number): void => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              balance: Math.max(0, Math.round((user.balance + delta) * 100) / 100),
            },
          }));
        },
        updateUser: (updatedFields: Partial<TUser>): void => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              ...updatedFields,
            },
          }));
        },
        updateDefaultData: (): void => set(() => ({ defaultData: false })),
        claimRank: (rankId: number) => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              rank: rankId,
            },
          }));
        },
        resetState: () => {
          set(() => ({
            ...initialState,
          }));
        },
        setWallet: (wallet: string) => {
          set(() => ({ wallet, walletClaimed: true }));
        },
      }),
      {
        name: STORE_NAME,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: (state) => {
          const previousState = localStorage.getItem(STORE_NAME);
          const defaultStateString = JSON.stringify({ state, version: 0 });
          return (_, error) => {
            if (error) {
              localStorage.setItem(STORE_NAME, defaultStateString);
            } else {
              localStorage.setItem(STORE_NAME, previousState || defaultStateString);
            }
          };
        },
      },
    ),
  ),
);
