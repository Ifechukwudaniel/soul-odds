import { apiClient } from "@/libs/ApiClient";
import {  User } from "../db/user";

export const getUserRefers = async (
  address:string
):Promise<User[]> => {
  try {
    let refers = (await apiClient.get(`/api/user/${address}/refers`)).data as User[];
    return refers
  } catch (error) {
    console.error(error);
    throw new Error("Could not get user refers ");
  }
};
