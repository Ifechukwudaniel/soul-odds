import { NextRequest, NextResponse } from "next/server";
import { requireApiSecret } from "@/libs/ApiAuth";
import { sinsConfig } from "@/lib/mortal-odds/config";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
import { readSinCatalog, writeSinCatalog } from "@/lib/mortal-odds/sin-catalog";
import type { SinCatalog, SinCatalogEntry } from "@/lib/mortal-odds/sin-catalog";

/** Every this-many-th time a place is served from the catalog, ask OpenRouter to grow its variant pool by one. */
const GROWTH_INTERVAL = 3;

/**
 * Records this use and, every `GROWTH_INTERVAL`th time, asks OpenRouter for one more variant —
 * fire-and-forget from the caller's point of view, so a place already in the catalog never waits
 * on this. Runs after the response has already gone out; safe here because this app runs as a
 * persistent `next start` process, not a serverless function that gets frozen post-response.
 *
 * Reads and writes the whole catalog file without locking, so two requests growing the same
 * place in the same instant can race and one write can be lost — acceptable for an approximate
 * "grow every few uses" cadence at this project's scale; a real fix would move the catalog into
 * the database, the way `services/db/user.ts`'s `addPoints` does its atomic increment.
 */
async function recordUseAndMaybeGrow(location: string, year: number): Promise<void> {
  const catalog = await readSinCatalog();
  const entry = catalog[location];
  if (!entry) return;

  entry.useCount += 1;
  if (entry.useCount % GROWTH_INTERVAL === 0) {
    try {
      entry.variants.push(await generateSinNarratives({ year, location }));
    } catch (error) {
      console.error(`Could not grow sin catalog for "${location}":`, error);
    }
  }
  await writeSinCatalog(catalog);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

async function seedCatalogEntry(catalog: SinCatalog, location: string, entry: SinCatalogEntry): Promise<void> {
  catalog[location] = entry;
  await writeSinCatalog(catalog);
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

  const catalog = await readSinCatalog();
  const entry = catalog[location];
  if (entry) {
    const response = NextResponse.json(pickRandom(entry.variants));
    void recordUseAndMaybeGrow(location, year);
    return response;
  }

  try {
    const narratives = await generateSinNarratives({ year, location });
    void seedCatalogEntry(catalog, location, { variants: [narratives], useCount: 1 });
    return NextResponse.json(narratives);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Could not generate sin narratives." }, { status: 502 });
  }
}
