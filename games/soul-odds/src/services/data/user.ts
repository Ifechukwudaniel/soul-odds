import axios from "axios";
import { User } from "@/services/db/user";


export const getUser = async (address:string) :Promise<User>=> {
  try {
    let user = (await axios.get(`/api/user/${address}`)).data as User;
    return user
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};
