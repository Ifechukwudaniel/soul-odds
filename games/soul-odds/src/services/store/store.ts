import { DEFAULT_AVATAR_ID } from "@/components/assets/characters/avatars";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type TScreens = "badges" | "boost" | "home" | "refs" | "stats" | "quests" | "social" | "wallet" | "ranks";

export type TBoost = {
  type: string;
  boostId: number;
  level?: number;
  maximumLevel?: number;
  cost?: number;
  userAddress: string;
};

export type TScreenPayload = {
  data?: string;
};

export type TUser = {
  address: string;
  username: string;
  touches: number;
  balance: number;
  rank: number;
  skill: number;
  connectionId: string;
  totalCoinsMined: number;
  avatarId: string;
};

export const STORE_NAME = "Soul_Odds_Store";

export const hasState = () => {
  return typeof window === "undefined" ? false : localStorage.getItem(STORE_NAME) !== null;
};

export const emptyUser: TUser = {
  address: "",
  username: "",
  touches: 0,
  balance: 1000,
  rank: 0,
  skill: 0,
  connectionId: "",
  totalCoinsMined: 1000,
  avatarId: DEFAULT_AVATAR_ID,
};

export type TAppStore = {
  hasData: boolean;
  defaultData: boolean;
  paidBoosts: TBoost[];
  screen: TScreens;
  user: TUser;
  wallet:string;
  walletCliamed:boolean;
  setScreen: (newValue: TScreens, payload?: TScreenPayload | null) => void;
  updateBalance: (newBalance: number) => void;
  applyBalanceDelta: (delta: number) => void;
  updatePaidBoostLevel: (boostId: number, newLevel: number) => void;
  updateUser: (updatedFields: Partial<TUser>) => void;
  setPaidBoosts: (boostFields: TBoost[]) => void;
  updateDefaultData: () => void;
  cliamRank: (rankId: number) => void;
  resetState: () => void;
};

export const initialState = {
  hasData: false,
  defaultData: true,
  paidBoosts: [],
  screen: "home" as TScreens,
  user: emptyUser,
  wallet:"",
  walletCliamed:false
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
          const balanceDifference = newBalance - user.balance;
          const additionalCoinsMined = balanceDifference > 0 ? balanceDifference : 0;
          set(() => ({
            user: {
              ...user,
              balance: newBalance,
              totalCoinsMined: user.totalCoinsMined + additionalCoinsMined,
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
        updatePaidBoostLevel: (boostId: number, newLevel: number): void => {
          const { paidBoosts } = get();
          const updatedBoosts = paidBoosts.map(boost => {
            if (boost.boostId === boostId) {
              return { ...boost, level: newLevel, cost: (boost.cost ?? 0) * 4 };
            }
            return boost;
          });
          set(() => ({ paidBoosts: updatedBoosts }));
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
        setPaidBoosts: (boosts: TBoost[]): void => set(() => ({ paidBoosts: boosts })),
        updateDefaultData: (): void => set(() => ({ defaultData: false })),
        cliamRank: (rankId: number) => {
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
        setWallet:(wallet:string) => {
           set(()=> ({wallet, walletCliamed:true}))
        }
      }),
      {
        name: STORE_NAME,
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: state => {
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

