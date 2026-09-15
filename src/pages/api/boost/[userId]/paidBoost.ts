import { NextApiRequest, NextApiResponse } from "next";
import "@/services/firebase";
import { getAllUserPaidBoosts } from "@/services/db/boost";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    try {
      const { userId } = req.query;
      const id = parseInt(userId as string)
      const user = await getAllUserPaidBoosts(id);
      return res.status(200).json(user);
    } catch (error: any) {
      return res.status(500).json({ message: "Method not allowed" });
    }
  }

  if (req.method === "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }
}