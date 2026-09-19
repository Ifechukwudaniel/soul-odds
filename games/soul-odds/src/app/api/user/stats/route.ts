import { NextResponse } from "next/server";
import {
  findAllUsers,
  getAllTokensInCircluation,
  getAllTouchesByAllUsers,
  getDailyUsers,
  getOnlineUserCount,
} from "@/services/db/user";


export type Stat = {
  online: number,
  totalUsers: number,
  totalTokens: number,
  totalTouches: number,
  totalDailyUsers: number
};

export async function GET() {
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

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error retrieving user stats:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while getting user stats." },
      { status: 500 },
    );
  }
}
