import { NextApiRequest, NextApiResponse } from "next";
import { findAllUsers, getOnlineUserCount, getAllTokensInCircluation, getAllTouchesByAllUsers, getDailyUsers } from "@/services/db/user";
import "@/services/firebase";

export type Stat = {
  online: number,
  totalUsers: number,
  totalTokens: number,
  totalTouches: number,
  totalDailyUsers: number
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  try {
    const onlineUsers = await getOnlineUserCount();
    const allUsers = await findAllUsers();
    const allTokensInCirculation = await getAllTokensInCircluation();
    const allTouchesByAllUsers = await getAllTouchesByAllUsers();
    const allDailyUsers = await getDailyUsers();

    const stats: Stat = {
      online: onlineUsers.count,
      totalUsers: allUsers.length,
      totalTokens: allTokensInCirculation.total,
      totalTouches: allTouchesByAllUsers.touches,
      totalDailyUsers: allDailyUsers.dailyUsers,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error("Error retrieving user stats:", error);
    return res.status(500).json({ message: "An unexpected error occurred while getting user stats." });
  }
}
