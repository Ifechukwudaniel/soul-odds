import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { sinsConfig } from "@/lib/mortal-odds/config";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
import type { SinPlaceContext } from "@/lib/mortal-odds/openrouter";
import { variantsCovering, withPeriod } from "@/lib/mortal-odds/sin-variants";
import {
  appendSinCatalogVariant,
  findSinCatalogEntry,
  incrementSinCatalogUseCount,
  insertSinCatalogEntry,
} from "@/services/db/sin-catalog";

/** Every this-many-th time a place is served from the catalog, ask OpenRouter to grow its variant pool by one. */
const GROWTH_INTERVAL = 3;

/**
 * Records this use and, every `GROWTH_INTERVAL`th time, asks OpenRouter for one more variant —
 * fire-and-forget from the caller's point of view, so a place already in the catalog never waits
 * on this. Runs after the response has already gone out; safe here because this app runs as a
 * persistent `next start` process, not a serverless function that gets frozen post-response.
 */
async function recordUseAndMaybeGrow(options: { location: string; year: number; place?: SinPlaceContext }): Promise<void> {
  const { location, year, place } = options;
  const useCount = await incrementSinCatalogUseCount(location);
  if (useCount === undefined || useCount % GROWTH_INTERVAL !== 0) return;

  try {
    await appendSinCatalogVariant(location, withPeriod(await generateSinNarratives({ year, location, place }), year));
  } catch (error) {
    console.error(`Could not grow sin catalog for "${location}":`, error);
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
  const entry = await findSinCatalogEntry(location);
  if (entry) {
    // An empire spans centuries, so only a variant written for this year's period is ever served;
    // when there is none, fall through and generate one for it.
    const pool = variantsCovering(entry.variants, year);
    if (pool.length > 0) {
      const response = NextResponse.json(pickRandom(pool));
      void recordUseAndMaybeGrow({ location, year, place });
      return response;
    }
  }

  try {
    const narratives = await generateSinNarratives({ year, location, place });
    const variant = withPeriod(narratives, year);
    void (entry ? appendSinCatalogVariant(location, variant) : insertSinCatalogEntry({ location, variants: [variant], useCount: 1 }));
    return NextResponse.json(narratives);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not generate sin narratives." }, { status: 502 });
  }
}
