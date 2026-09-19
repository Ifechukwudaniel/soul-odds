import type { SinConfig } from "@/lib/mortal-odds/config";
import type { Rng } from "@/lib/mortal-odds/rng";
import type { RegionId } from "@/types";

/**
 * The first sin in the catalog whose era overlaps this life's years is the one recorded,
 * mirroring how applyShocks resolves catastrophes. `region` is null for the bookie's
 * year-only model, which falls back to each sin's flat "all" rate.
 */
export function pickSin(options: { year: number; deathYear: number; region: RegionId | null; rng: Rng; sins: SinConfig[] }): SinConfig | null {
  const { year, deathYear, region, rng, sins } = options;

  for (const sin of sins) {
    const base = (region ? sin.rate[region] : undefined) ?? sin.rate.all;
    if (!base) continue;

    const to = sin.to ?? Infinity;
    if (deathYear < sin.from || year > to) continue;

    if (rng() < base) return sin;
  }

  return null;
}

/**
 * A hand-full of candidate sins for one round's market, drawn fresh per soul from the full
 * catalog — never the whole list, so the catalog can grow arbitrarily without the bet
 * becoming a wall of options. Later this selection moves server-side; this is the client
 * stand-in for that. Only sins whose window hasn't closed before the soul's birth year are
 * eligible, so a player is never offered a choice that could never have happened.
 */
export function pickSinOptions(options: { sins: SinConfig[]; year: number; rng: Rng; count: number }): SinConfig[] {
  const { sins, year, rng, count } = options;
  const eligible = sins.filter((sin) => sin.to === null || sin.to >= year);
  const pool = eligible.length >= count ? eligible : sins;

  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
