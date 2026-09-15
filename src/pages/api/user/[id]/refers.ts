import { NextApiRequest, NextApiResponse } from "next";
import { getUserRefers } from "@/services/db/user";
import "@/services/firebase";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  
  if(req.method !== "GET") {
      return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const { id } = req.query;
    const user = await getUserRefers(id as string);
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error userRefers", error);
    res.status(500).json({ message: "An unexpected error occurred while getting user stats." });
  }
}