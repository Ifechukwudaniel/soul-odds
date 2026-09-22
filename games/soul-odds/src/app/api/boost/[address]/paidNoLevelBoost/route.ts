import { NextResponse } from "next/server";
import { getAllUserPaidNoLevelsBoosts } from "@/services/db/boost";

export async function GET(_request: Request, props: { params: Promise<{ address: string }> }) {
  try {
    const { address } = await props.params;
    const boosts = await getAllUserPaidNoLevelsBoosts(address);
    return NextResponse.json(boosts);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
