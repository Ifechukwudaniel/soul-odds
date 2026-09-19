import axios from "axios";
import { Boost } from "@/services/db/boost";


export const getFreeBoost = async (userId:number) :Promise<Boost[]>=> {
  try {
    let boosts = (await axios.get(`/api/boost/${userId}/freeBoost`)).data as Boost[]
    return boosts
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};

export const getPayedBoost = async (userId:number) :Promise<Boost[]>=> {
    try {
      let boosts = (await axios.get(`/api/boost/${userId}/paidBoost`)).data as Boost[]
      return boosts
    } catch (error) {
      console.error(error);
      throw new Error("Could not get user refers ");
    }
};
export const getNoLevelBoost = async (userId:number) :Promise<Boost[]>=> {
    try {
      let boosts = (await axios.get(`/api/boost/${userId}/paidNoLevelBoost`)).data as Boost[]
      return boosts
    } catch (error) {
      console.error(error);
      throw new Error("Could not get user refers ");
    }
  };
    