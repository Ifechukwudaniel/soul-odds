import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { SOCIAL_TASK_IDS } from "@/lib/social-quests";
import { claimSocialReward } from "@/services/db/user";

export async function POST(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const { address } = await request.json();
  if (typeof address !== "string" || !address) {
    return NextResponse.json({ message: "Invalid Parameter" }, { status: 400 });
  }

  const user = await claimSocialReward(address, SOCIAL_TASK_IDS);
  if (!user) {
    return NextResponse.json({ message: "Reward unavailable." }, { status: 409 });
  }

  return NextResponse.json({ freeRedraws: user.freeRedraws });
}
