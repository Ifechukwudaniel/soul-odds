import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { sinsConfig } from "@/lib/mortal-odds/config";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
import type { SinPlaceContext } from "@/lib/mortal-odds/openrouter";
import { periodOf } from "@/lib/mortal-odds/sin-variants";
import { findSinVariantsCovering, insertSinVariant } from "@/services/db/sin-catalog";
import type { SinCatalogRow } from "@/services/db/sin-catalog";

/** On average one in this many times a variant is served from the catalog, ask OpenRouter to grow its period's pool by one. */
const GROWTH_ONE_IN = 3;

/**
 * Now and then asks OpenRouter for one more variant for the same period — fire-and-forget from
 * the caller's point of view, so a place already in the catalog never waits on this. Runs after
 * the response has already gone out; safe here because this app runs as a persistent
 * `next start` process, not a serverless function that gets frozen post-response.
 */
async function maybeGrow(options: { served: SinCatalogRow; year: number; place?: SinPlaceContext }): Promise<void> {
  const { served, year, place } = options;
  if (Math.random() * GROWTH_ONE_IN >= 1) return;

  try {
    const narratives = await generateSinNarratives({ year, location: served.location, place });
    await insertSinVariant({ location: served.location, fromYear: served.fromYear, toYear: served.toYear, narratives });
  } catch (error) {
    console.error(`Could not grow sin catalog for "${served.location}":`, error);
  }
}

/** Reads the optional place details (`lat`, `lon` and, for real polities, `fromYear`/`toYear`); undefined unless the coordinates are both valid. */
function readPlaceContext(params: URLSearchParams): SinPlaceContext | undefined {
  const finite = (key: string) => (params.get(key) === null ? undefined : Number.isFinite(Number(params.get(key))) ? Number(params.get(key)) : undefined);
  const lat = finite("lat");
  const lon = finite("lon");
  if (lat === undefined || lon === undefined) return undefined;
  return { lat, lon, fromYear: finite("fromYear"), toYear: finite("toYear") };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export async function GET(request: NextRequest) {
  const unauthorized = requireApiSecret(request);
  if (unauthorized) {
    return unauthorized;
  }

  const yearParam = request.nextUrl.searchParams.get("year");
  const location = request.nextUrl.searchParams.get("location");

  if (yearParam === null && location === null) {
    return NextResponse.json(sinsConfig);
  }

  const year = Number(yearParam);
  if (yearParam === null || !Number.isFinite(year)) {
    return NextResponse.json({ message: 'Missing or invalid "year" query parameter.' }, { status: 400 });
  }

  if (!location) {
    return NextResponse.json({ message: 'Missing "location" query parameter.' }, { status: 400 });
  }

  const place = readPlaceContext(request.nextUrl.searchParams);
  // An empire spans centuries, so only a variant written for this year's period is ever served;
  // when there is none, fall through and generate one for it.
  const covering = await findSinVariantsCovering(location, year);
  if (covering.length > 0) {
    const served = pickRandom(covering);
    const response = NextResponse.json(served.narratives);
    void maybeGrow({ served, year, place });
    return response;
  }

  try {
    const narratives = await generateSinNarratives({ year, location, place });
    void insertSinVariant({ location, ...periodOf(year), narratives });
    return NextResponse.json(narratives);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not generate sin narratives." }, { status: 502 });
  }
}
