import type { EraConfig } from "@/lib/mortal-odds/config";
import { worldPopCurve } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { regionShare } from "@/lib/mortal-odds/draw";
import type { RegionId } from "@/types";

/** Approximate land area of each region in km², to turn its share of the world's people into a density. */
const REGION_LAND_KM2: Record<RegionId, number> = {
  ssa: 24_300_000,
  mena: 11_500_000,
  eur: 10_200_000,
  sas: 4_400_000,
  eas: 11_800_000,
  sea: 4_500_000,
  ame: 42_500_000,
};

/** People per km² across a region in a year: the world's population, split by the region's share of it, over the region's land. */
export function densityAt(options: { year: number; region: RegionId; erasConfig: EraConfig[] }): number {
  const { year, region, erasConfig } = options;
  const world = interpolate({ points: worldPopCurve, x: year });
  return (world * regionShare({ year, region, erasConfig })) / REGION_LAND_KM2[region];
}

/** The people a territory held: the region's density that year times the territory's area, never more than the world had. */
export function populationFromDensity(options: { year: number; region: RegionId; areaKm2: number; erasConfig: EraConfig[] }): number {
  const { year, areaKm2 } = options;
  return Math.min(interpolate({ points: worldPopCurve, x: year }), densityAt(options) * areaKm2);
}
