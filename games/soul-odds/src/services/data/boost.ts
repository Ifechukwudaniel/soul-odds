import axios from "axios";
import { Boost } from "@/services/db/boost";


export const getFreeBoost = async (address:string) :Promise<Boost[]>=> {
  try {
    let boosts = (await axios.get(`/api/boost/${address}/freeBoost`)).data as Boost[]
    return boosts
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};

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
    