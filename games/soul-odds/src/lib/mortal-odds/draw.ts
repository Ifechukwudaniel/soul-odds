import type { EraConfig, PlaceConfig } from "@/lib/mortal-odds/config";
import { HUMANS_EVER, MODES } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { fmtNumber, fmtPeople, periodName } from "@/lib/mortal-odds/format";
import { eraFor } from "@/lib/mortal-odds/geo";
import { pickWeighted } from "@/lib/mortal-odds/rng";
import type { Rng } from "@/lib/mortal-odds/rng";
import type { Draw, EraFilter, Place, PlaceContext, RegionId } from "@/types";

/** Weighted-picks an era and year within it, then a region from that era's shares. */
export function drawBirth(options: { era: EraFilter; rng: Rng; erasConfig: EraConfig[]; currentYear: number }): {
  year: number;
  region: RegionId;
} {
  const { era, rng, erasConfig, currentYear } = options;
  const eligible = erasConfig.filter((e) => e.from >= MODES[era]);
  const picked = pickWeighted({ items: eligible, weight: (e) => e.births, rng });
  const to = picked.to ?? currentYear;
  const year = Math.floor(picked.from + (to - picked.from) * rng() ** (1 / picked.skew));
  const regionIds = Object.keys(picked.shares) as RegionId[];
  const region = pickWeighted({ items: regionIds, weight: (id) => picked.shares[id], rng });
  return { year: Math.min(year, currentYear - 1), region };
}

/** Weighted-picks a specific sub-region place within a region. */
export function pickPlace(options: { region: RegionId; rng: Rng; placesConfig: Record<RegionId, PlaceConfig[]> }): Place {
  const { region, rng, placesConfig } = options;
  const candidates = placesConfig[region];
  const picked = pickWeighted({ items: candidates, weight: (p) => p.weight, rng });
  const total = candidates.reduce((sum, p) => sum + p.weight, 0);
  return { name: picked.name, continent: picked.continent, share: picked.weight / total, lat: picked.lat, lon: picked.lon };
}

/** The drawn region's share of births in the year's era, relative to all regions that era. */
export function regionShare(options: { year: number; region: RegionId; erasConfig: EraConfig[] }): number {
  const { year, region, erasConfig } = options;
  const era = eraFor({ year, erasConfig });
  const total = Object.values(era.shares).reduce((sum, share) => sum + share, 0);
  return era.shares[region] / total;
}

/** Builds the place-context text shown alongside a drawn human: where, local population, and era. */
export function placeContext(options: {
  draw: Draw;
  erasConfig: EraConfig[];
  worldPopCurve: ReadonlyArray<readonly [number, number]>;
  currentYear: number;
}): Omit<PlaceContext, "story"> {
  const { draw, erasConfig, worldPopCurve, currentYear } = options;
  const world = interpolate({ points: worldPopCurve, x: draw.year });
  const share = regionShare({ year: draw.year, region: draw.region, erasConfig });
  const local = world * share * draw.place.share;

  return {
    where: `${draw.place.name}, ${draw.place.continent}`,
    local: `About ${fmtPeople(local)} people lived there then.`,
    when: `${fmtNumber(currentYear - draw.year)} years ago, ${periodName(draw.year)}. About ${fmtPeople(world)} people were alive, ${((world / HUMANS_EVER) * 100).toFixed(3)}% of all humans ever.`,
  };
}
