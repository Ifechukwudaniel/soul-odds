import axios from "axios";
import {UserTask} from '@/types';

export const getUserTasks = async (
  address:string
):Promise<UserTask[]> => {
  try {
    const tasks = (await axios.get(`/api/tasks?address=${address}`)).data as UserTask[];
    return tasks
  } catch (error) {
    console.log(error)
    throw new Error("Could not get user tasks ");
  }
};



export const postUserTasks = async ( address:string, taskId:number) => {
  const data = JSON.stringify({address,taskId});
  try {
      await axios.post("/api/tasks",data)
  } catch (error) {
      throw new Error("Could not post data");
  }
}
