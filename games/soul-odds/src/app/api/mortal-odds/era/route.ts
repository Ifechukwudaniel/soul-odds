import { NextRequest, NextResponse } from "next/server";
import { erasConfig } from "@/lib/mortal-odds/config";
import { eraFor } from "@/lib/mortal-odds/geo";

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = Number(yearParam);

  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }

  const era = eraFor({ year, erasConfig });
  return NextResponse.json(era);
}
