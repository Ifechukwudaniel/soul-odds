import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { erasConfig, placesConfig } from "@/lib/mortal-odds/config";
import { pickPlace, regionShare } from "@/lib/mortal-odds/draw";
import { eraFor } from "@/lib/mortal-odds/geo";
import { createRng, pickWeighted } from "@/lib/mortal-odds/rng";
import { pickCliopatriaPlace } from "@/services/db/cliopatria";
import type { RegionId } from "@/types";

const MIN_SUPPORTED_YEAR = -10_000;

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const yearParam = request.nextUrl.searchParams.get("year");
  const year = Number(yearParam);

  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }

  if (year < MIN_SUPPORTED_YEAR) {
    return NextResponse.json({ message: `"year" must be no earlier than ${MIN_SUPPORTED_YEAR}.` }, { status: 400 });
  }

  const rng = createRng();

  const cliopatriaPlace = await pickCliopatriaPlace(year);
  if (cliopatriaPlace) {
    return NextResponse.json({
      name: cliopatriaPlace.name,
      lat: cliopatriaPlace.lat,
      lon: cliopatriaPlace.lon,
      fromYear: cliopatriaPlace.fromYear,
      toYear: cliopatriaPlace.toYear,
      year,
      source: "cliopatria",
    });
  }

  const era = eraFor({ year, erasConfig });
  const regionIds = Object.keys(era.shares) as RegionId[];
  const region = pickWeighted({ items: regionIds, weight: (id) => era.shares[id], rng });
  const place = pickPlace({ region, rng, placesConfig });

  return NextResponse.json({
    name: place.name,
    lat: place.lat,
    lon: place.lon,
    fromYear: era.from,
    toYear: era.to,
    region,
    regionShare: regionShare({ year, region, erasConfig }),
    year,
    source: "places-fallback",
  });
}
