import { apiClient } from "@/libs/ApiClient";
import {UserTask} from '@/types';

export const getUserTasks = async (
  address:string
):Promise<UserTask[]> => {
  try {
    const tasks = (await apiClient.get(`/api/tasks?address=${address}`)).data as UserTask[];
    return tasks
  } catch (error) {
    console.log(error)
    throw new Error("Could not get user tasks ");
  }
};



export const postUserTasks = async ( address:string, taskId:number) => {
  const data = JSON.stringify({address,taskId});
  try {
      await apiClient.post("/api/tasks",data)
  } catch (error) {
      throw new Error("Could not post data");
  }
}

/** Claims the social quest's free redraw. Rejects when the quest is incomplete or already claimed. */
export const claimSocialReward = async (address: string): Promise<{ freeRedraws: number }> => {
  return (await apiClient.post("/api/tasks/claim", { address })).data;
};
