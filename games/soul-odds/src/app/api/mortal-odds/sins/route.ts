import { NextResponse } from "next/server";
import { sinsConfig } from "@/lib/mortal-odds/config";

export async function GET() {
  return NextResponse.json(sinsConfig);
}
