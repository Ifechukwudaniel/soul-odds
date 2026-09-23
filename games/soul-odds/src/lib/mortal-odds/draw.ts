import type { EraConfig, PlaceConfig } from "@/lib/mortal-odds/config";
import { HUMANS_EVER, MODES } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { fmtNumber, fmtPeople, fmtYear, periodName } from "@/lib/mortal-odds/format";
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

/**
 * Weighted-picks a specific sub-region place within a region. Folds the continent into `name`
 * (`"City, Continent"`) to match the shape `/api/mortal-odds/place`'s synthetic fallback already
 * returns — see `lib/mortal-odds/place.ts`'s `toPlace`, which normalizes both into one `Place`.
 */
export function pickPlace(options: { region: RegionId; rng: Rng; placesConfig: Record<RegionId, PlaceConfig[]> }): Place {
  const { region, rng, placesConfig } = options;
  const candidates = placesConfig[region];
  const picked = pickWeighted({ items: candidates, weight: (p) => p.weight, rng });
  const total = candidates.reduce((sum, p) => sum + p.weight, 0);
  return { name: `${picked.name}, ${picked.continent}`, share: picked.weight / total, lat: picked.lat, lon: picked.lon };
}

/** A region's share of births in an already-resolved era, relative to all regions that era. */
export function regionShareInEra(options: { region: RegionId; era: EraConfig }): number {
  const { region, era } = options;
  const total = Object.values(era.shares).reduce((sum, share) => sum + share, 0);
  return era.shares[region] / total;
}

/** The drawn region's share of births in the year's era, relative to all regions that era. */
export function regionShare(options: { year: number; region: RegionId; erasConfig: EraConfig[] }): number {
  const { year, region, erasConfig } = options;
  return regionShareInEra({ region, era: eraFor({ year, erasConfig }) });
}

/**
 * Builds the place-context text shown alongside a drawn human: where, local population, and era.
 * Takes the year's era pre-resolved (the backend's `/api/mortal-odds/era`, or the local `eraFor`
 * fallback — see `useMortalOddsDraw.ts`) rather than looking it up itself, so this function stays
 * agnostic to where that data came from.
 *
 * The "where" line differs by what the place actually is: a synthetic pick (`share` set) gets an
 * estimated local population; a real historical polity (`fromYear`/`toYear` set, from Cliopatria)
 * gets its real attested date range instead — there's no population share to estimate for it.
 */
export function placeContext(options: {
  draw: Draw;
  era: EraConfig;
  worldPopCurve: ReadonlyArray<readonly [number, number]>;
  currentYear: number;
}): Omit<PlaceContext, "story"> {
  const { draw, era, worldPopCurve, currentYear } = options;
  const world = interpolate({ points: worldPopCurve, x: draw.year });

  let local = "";
  if (draw.place.share !== undefined) {
    const share = regionShareInEra({ region: draw.region, era });
    local = `About ${fmtPeople(world * share * draw.place.share)} people lived there then.`;
  } else if (draw.place.fromYear !== undefined && draw.place.toYear !== undefined) {
    local = `This place endured from ${fmtYear(draw.place.fromYear)} to ${fmtYear(draw.place.toYear)}.`;
  }

  return {
    where: draw.place.name,
    local,
    when: `${fmtNumber(currentYear - draw.year)} years ago, ${periodName(draw.year)}. About ${fmtPeople(world)} people were alive, ${((world / HUMANS_EVER) * 100).toFixed(3)}% of all humans ever.`,
  };
}
