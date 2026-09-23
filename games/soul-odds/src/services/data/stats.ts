import { apiClient } from "@/libs/ApiClient";
import { Stat } from "@/app/api/user/stats/route";

export const getStats = async () :Promise<Stat>=> {
  try {
    let stats = (await apiClient.get(`/api/user/stats`)).data as Stat;
    return stats
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};
