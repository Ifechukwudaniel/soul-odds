import { NextRequest, NextResponse } from "next/server";
import { erasConfig } from "@/lib/mortal-odds/config";
import { eraFor } from "@/lib/mortal-odds/geo";
import titleFile from "@/config/mortal-odds/soul-odds-title.json";

/** The on-chain `SoulEra` name for a birth year, mirroring `eraFor`'s find-or-fall-back-to-last pattern. */
function soulEraFor(year: number): string {
  const betConfigurations = titleFile.betConfigurations;
  const match = betConfigurations.find((config) => year >= config.minBirthYear && year < config.maxBirthYear);
  const config = match ?? betConfigurations.at(-1);
  if (!config) {
    throw new Error("soulEraFor: betConfigurations must not be empty");
  }
  return config.era;
}

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const year = Number(yearParam);

  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }

  const era = eraFor({ year, erasConfig });
  return NextResponse.json({ ...era, era: soulEraFor(year) });
}
