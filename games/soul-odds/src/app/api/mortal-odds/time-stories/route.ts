import { NextResponse } from "next/server";
import { timeStories } from "@/lib/mortal-odds/time-story";

export async function GET() {
  return NextResponse.json(timeStories);
}
