import { NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { getAllUserPaidBoosts } from "@/services/db/boost";

export async function GET(request: Request, props: { params: Promise<{ address: string }> }) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { address } = await props.params;
    const boosts = await getAllUserPaidBoosts(address);
    return NextResponse.json(boosts);
  } catch (error) {
    return NextResponse.json({ message: "Method not allowed" }, { status: 500 });
  }
}
