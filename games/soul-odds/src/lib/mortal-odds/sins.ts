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
