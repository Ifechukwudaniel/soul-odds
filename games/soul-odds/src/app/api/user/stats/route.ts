import { NextResponse } from "next/server";
import { findAllUsers, getAllTokensInCirculation } from "@/services/db/user";


export type Stat = {
  totalUsers: number,
  totalTokens: number,
};

export async function GET() {
  try {
    const allUsers = await findAllUsers();
    const allTokensInCirculation = await getAllTokensInCirculation();

    const stats: Stat = {
      totalUsers: allUsers.length,
      totalTokens: allTokensInCirculation.total,
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
