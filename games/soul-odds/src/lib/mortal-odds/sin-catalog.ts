import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SinNarratives } from "@/lib/mortal-odds/openrouter";

/**
 * A place's pool of pre-generated sin narratives, plus how many times it's been served. Serving
 * picks randomly among `variants` so a place doesn't always show the exact same sin; `useCount`
 * drives when the live route asks OpenRouter to grow the pool with one more (see
 * `GROWTH_INTERVAL` in the sins route) — a place seen more starts feeling less repetitive.
 */
export type SinCatalogEntry = { variants: SinNarratives[]; useCount: number };
export type SinCatalog = Record<string, SinCatalogEntry>;

const CATALOG_PATH = path.join(process.cwd(), "src/config/mortal-odds/sin-catalog.json");

/**
 * Reads the catalog fresh off disk every call rather than caching it in memory: it's a small
 * file, read far less often than the game is played, and this way a write from another request
 * (or the offline generator script) is always visible on the next read.
 */
export async function readSinCatalog(): Promise<SinCatalog> {
  try {
    const raw = await readFile(CATALOG_PATH, "utf-8");
    return JSON.parse(raw) as SinCatalog;
  } catch {
    return {};
  }
}

export async function writeSinCatalog(catalog: SinCatalog): Promise<void> {
  await writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2));
}
