import axios from "axios";
import { User } from "@/services/db/user";


export const getUser = async (userId:number) :Promise<User>=> {
  try {
    let user = (await axios.get(`/api/user/${userId}`)).data as User;
    return user
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};
