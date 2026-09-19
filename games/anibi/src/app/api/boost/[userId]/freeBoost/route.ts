import { NextResponse } from "next/server";
import { getAllUserFreeBoosts } from "@/services/db/boost";

export async function GET(_request: Request, props: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await props.params;
    const boosts = await getAllUserFreeBoosts(parseInt(userId));
    return NextResponse.json(boosts);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
