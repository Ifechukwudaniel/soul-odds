import { NextRequest, NextResponse } from "next/server";
import { erasConfig, placesConfig } from "@/lib/mortal-odds/config";
import { pickPlace, regionShare } from "@/lib/mortal-odds/draw";
import { eraFor } from "@/lib/mortal-odds/geo";
import { createRng, pickWeighted } from "@/lib/mortal-odds/rng";
import { pickCliopatriaPlace } from "@/services/db/cliopatria";
import type { RegionId } from "@/types";

const RANDOM_YEAR_MIN = -3000;

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year");
  const rng = createRng();

  let year: number;
  if (yearParam === null) {
    const currentYear = new Date().getFullYear();
    year = RANDOM_YEAR_MIN + Math.floor(rng() * (currentYear - RANDOM_YEAR_MIN));
  } else {
    year = Number(yearParam);
    if (!Number.isFinite(year)) {
      return NextResponse.json({ message: 'Invalid "year" query parameter.' }, { status: 400 });
    }
  }

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

  // Cliopatria has nothing for this year (or isn't loaded on this machine) - fall back to the
  // hand-curated regions in placesConfig, same weighted pick the birth-draw flow itself uses.
  const era = eraFor({ year, erasConfig });
  const regionIds = Object.keys(era.shares) as RegionId[];
  const region = pickWeighted({ items: regionIds, weight: (id) => era.shares[id], rng });
  const place = pickPlace({ region, rng, placesConfig });

  return NextResponse.json({
    name: `${place.name}, ${place.continent}`,
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
