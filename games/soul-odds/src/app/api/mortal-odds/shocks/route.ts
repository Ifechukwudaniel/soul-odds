import { NextResponse } from "next/server";
import { shocksConfig } from "@/lib/mortal-odds/config";

export async function GET() {
  return NextResponse.json(shocksConfig);
}
