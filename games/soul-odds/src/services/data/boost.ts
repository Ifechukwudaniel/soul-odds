import axios from "axios";
import { Boost } from "@/services/db/boost";
import type { TBoost } from "@/services/store/store";

/** Maps a DB boost row (nullable level/cost/maximumLevel) to the store's shape. */
export const toTBoost = (boost: Boost): TBoost => ({
  type: boost.type,
  boostId: boost.boostId,
  level: boost.level ?? undefined,
  maximumLevel: boost.maximumLevel ?? undefined,
  cost: boost.cost ?? undefined,
  userAddress: boost.userAddress,
});

export const getPayedBoost = async (address:string) :Promise<Boost[]>=> {
    try {
      let boosts = (await axios.get(`/api/boost/${address}/paidBoost`)).data as Boost[]
      return boosts
    } catch (error) {
      console.error(error);
      throw new Error("Could not get user refers ");
    }
};
export const getNoLevelBoost = async (address:string) :Promise<Boost[]>=> {
    try {
      let boosts = (await axios.get(`/api/boost/${address}/paidNoLevelBoost`)).data as Boost[]
      return boosts
    } catch (error) {
      console.error(error);
      throw new Error("Could not get user refers ");
    }
  };
    