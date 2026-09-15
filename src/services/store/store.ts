import { Energy } from "../db/user";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { Env } from "@/libs/Env";

export type TScreens = "badges" | "boost" | "home" | "refs" | "stats" | "quests" | "social" | "wallet";

export type TBoost = {
  type: string;
  boostId: number;
  totalPerDay?: number;
  left?: number;
  level?: number;
  maximumLevel?: number;
  cost?: number;
  userId: number;
  lastUsed?: Date;
};

export type TScreenPayload = {
  data?: string;
};

export type TUser = {
  id: number;
  username: string;
  first: string;
  last: string;
  touches: number;
  tapValue: number;
  balance: number;
  rank: number;
  energy: Energy;
  connectionId: string;
  totalCoinsMined: number;
  totalRefered: number;
  totalReferedCliamed: number;
  lastExtraTap: Date | null;
  lastRefillTap: Date | null;
};

export const STORE_NAME = "Touch_Swap_Store";

export const hasState = () => {
  return typeof window === "undefined" ? false : localStorage.getItem(STORE_NAME) !== null;
};

export const emptyUser: TUser = {
  id: -1,
  username: "",
  first: "",
  last: "",
  touches: 0,
  balance: 1000,
  rank: 0,
  tapValue: 1,
  energy: {
    maxEnergy: 500,
    energyLeft: 100,
  },
  connectionId: "",
  totalCoinsMined: 1000,
  totalRefered: 150,
  totalReferedCliamed: 100,
  lastExtraTap: null,
  lastRefillTap: null,
};

type AutoClick = {
  active: boolean;
  startedOn: Date;
};

export type TAppStore = {
  hasData: boolean;
  autoClick: AutoClick | null;
  rechargeSpeed: number;
  defaultData: boolean;
  extraTap: boolean;
  freeBoosts: TBoost[];
  paidBoosts: TBoost[];
  screen: TScreens;
  user: TUser;
  wallet:string;
  walletCliamed:boolean;
  setScreen: (newValue: TScreens, payload?: TScreenPayload | null) => void;
  updateBalance: (newBalance: number) => void;
  updatePaidBoostLevel: (boostId: number, newLevel: number) => void;
  useEnergy: (amount: number) => void;
  updateUser: (updatedFields: Partial<TUser>) => void;
  setExtraTap: (isTrue: boolean) => void;
  setPaidBoosts: (boostFields: TBoost[]) => void;
  setFreeBoosts: (boostFields: TBoost[]) => void;
  useRefill: () => void;
  updateDefaultData: () => void;
  increaseMaxEnergy: () => void;
  increaseTap: () => void;
  updateEnergyByTime: () => void;
  activateAutoClick: () => void;
  deActivateAutoClick: () => void;
  cliamRank: (rankId: number) => void;
  updateTotalReferedCliamed: (refer: number) => void;
  resetState: () => void;
  updateBoostLeft: (left: number, boostId: number) => void;
};

export const initialState = {
  hasData: false,
  autoClick: null,
  rechargeSpeed: 0,
  defaultData: true,
  extraTap: false,
  freeBoosts: [],
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
        setExtraTap: (isTrue: boolean): void => {
          const { user, paidBoosts, freeBoosts } = get();
          const touchLevel = (paidBoosts.find(boost => boost.boostId === 4)?.level ?? 0) + 1;
          const touchValue = isTrue ? Math.floor(touchLevel * 5) : touchLevel;
          const newFreeBoosts = freeBoosts.map(boost => {
            if (isTrue && boost.boostId === 1 && boost.left !== undefined) {
              return { ...boost, left: boost.left - 1, lastUsed: new Date() };
            }
            return boost;
          });

          set(() => ({
            extraTap: isTrue,
            user: {
              ...user,
              tapValue: touchValue,
              lastExtraTap: isTrue ? new Date() : null,
            },
            freeBoosts: newFreeBoosts,
          }));
        },
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
        useRefill: (): void => {
          const { user, freeBoosts } = get();
          const newFreeBoosts = freeBoosts.map(boost => {
            if (boost.boostId === 2 && boost.left !== undefined) {
              return { ...boost, left: boost.left - 1, lastUsed: new Date() };
            }
            return boost;
          });

          set(() => ({
            user: {
              ...user,
              lastRefillTap: new Date(),
              energy: {
                ...user.energy,
                energyLeft: user.energy.maxEnergy,
              },
            },
            freeBoosts: newFreeBoosts,
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
        useEnergy: (amount: number): void => {
          const { user, extraTap } = get();
          const newCurrentEnergy = extraTap
            ? Math.max(user.energy.energyLeft, 0)
            : Math.max(user.energy.energyLeft - amount, 0);
          set(() => ({
            user: {
              ...user,
              touches:user.touches+1,
              energy: {
                ...user.energy,
                energyLeft: newCurrentEnergy,
              },
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
        setPaidBoosts: (boosts: TBoost[]): void => set(() => ({ paidBoosts: boosts })),
        setFreeBoosts: (boosts: TBoost[]): void => set(() => ({ freeBoosts: boosts })),
        updateDefaultData: (): void => set(() => ({ defaultData: false })),
        increaseMaxEnergy: (): void => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              energy: {
                ...user.energy,
                maxEnergy: user.energy.maxEnergy * 2,
              },
            },
          }));
        },
        increaseTap: (): void => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              tapValue: user.tapValue + 1,
            },
          }));
        },
        updateEnergyByTime: (): void => {
          const { user, paidBoosts } = get();

          if (user.energy.energyLeft === user.energy.maxEnergy) return;
          const boostLevel = (paidBoosts.find(boost => boost.boostId === 3)?.level ?? 0) + 1;
          let newEnergyLeft = user.energy.energyLeft + boostLevel;

          if (newEnergyLeft > user.energy.maxEnergy) {
            newEnergyLeft = user.energy.maxEnergy;
          }

          set(() => ({
            user: {
              ...user,
              energy: {
                ...user.energy,
                energyLeft: newEnergyLeft,
              },
            },
          }));
        },
        activateAutoClick: () => {
          set(() => ({ autoClick: { active: true, startedOn: new Date() } }));
        },
        deActivateAutoClick: () => {
          set(() => ({ autoClick: null }));
        },
        cliamRank: (rankId: number) => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              rank: rankId,
            },
          }));
        },
        updateTotalReferedCliamed: (refer: number) => {
          const { user } = get();
          set(() => ({
            user: {
              ...user,
              totalReferedCliamed: refer,
            },
          }));
        },
        resetState: () => {
          set(() => ({
            ...initialState,
          }));
        },
        updateBoostLeft: (left: number, boostId: number) => {
          const { freeBoosts } = get();
          const updatedBoosts = freeBoosts.map(boost => {
            if (boost.boostId === boostId) {
              return { ...boost, left };
            }
            return boost;
          });
          set(() => ({ freeBoosts: updatedBoosts }));
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

if (Env.NODE_ENV === "development") {
  mountStoreDevtool(STORE_NAME, useAppStore);
}

