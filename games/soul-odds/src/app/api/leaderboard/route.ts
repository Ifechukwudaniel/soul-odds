import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { getLeaderboard, type LeaderboardSort } from "@/services/db/user";

const SORT_OPTIONS: LeaderboardSort[] = ["points", "balance"];

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const sortByParam = request.nextUrl.searchParams.get("sortBy");
    const sortBy: LeaderboardSort = SORT_OPTIONS.includes(sortByParam as LeaderboardSort)
      ? (sortByParam as LeaderboardSort)
      : "points";

    const limitParam = Number(request.nextUrl.searchParams.get("limit"));
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? limitParam : undefined;

    const address = request.nextUrl.searchParams.get("address") ?? undefined;

    const users = await getLeaderboard(sortBy, limit, address);
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred while getting the leaderboard." },
      { status: 500 },
    );
  }
}
