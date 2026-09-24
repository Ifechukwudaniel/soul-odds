import { REGION_IDS } from '@/lib/mortal-odds/config';
import type { EraConfig, LandRing, PlaceConfig } from '@/lib/mortal-odds/config';
import type { RegionId } from '@/types';

export type Viewport = { width: number; height: number };
export type Point = { x: number; y: number };

/** Equirectangular: longitude and latitude map linearly onto the viewport, which keeps the graticule a plain grid. */
export function project(options: { lon: number; lat: number; viewport: Viewport }): Point {
  const { lon, lat, viewport } = options;
  return {
    x: ((lon + 180) / 360) * viewport.width,
    y: ((90 - lat) / 180) * viewport.height,
  };
}

/** Every land ring as one SVG path, so the whole silhouette renders as a single node. */
export function landPath(options: { rings: readonly LandRing[]; viewport: Viewport }): string {
  const { rings, viewport } = options;

  return rings
    .map((ring) =>
      ring
        .map(([lon, lat], index) => {
          const { x, y } = project({ lon, lat, viewport });
          return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
        })
        .join('')
        .concat('Z'),
    )
    .join('');
}

export type GraticuleLines = { verticals: number[]; horizontals: number[] };

/** Meridian and parallel positions at a fixed degree step, excluding the frame edges. */
export function graticule(options: { stepDegrees: number; viewport: Viewport }): GraticuleLines {
  const { stepDegrees, viewport } = options;
  const verticals: number[] = [];
  const horizontals: number[] = [];

  for (let lon = -180 + stepDegrees; lon < 180; lon += stepDegrees) {
    verticals.push(project({ lon, lat: 0, viewport }).x);
  }
  for (let lat = -90 + stepDegrees; lat < 90; lat += stepDegrees) {
    horizontals.push(project({ lon: 0, lat, viewport }).y);
  }

  return { verticals, horizontals };
}

/** The era covering a year, falling back to the most recent one for years past the last era's end. */
export function eraFor(options: { year: number; erasConfig: EraConfig[] }): EraConfig {
  const { year, erasConfig } = options;
  const match = erasConfig.find((era) => year >= era.from && era.to !== null && year < era.to);
  const era = match ?? erasConfig.at(-1);
  if (!era) {
    throw new Error('eraFor: erasConfig must not be empty');
  }
  return era;
}

export type DensityBlob = Point & { id: string; intensity: number };

/**
 * Where people lived in a given year: each place carries its region's share of that era's
 * population, split across the region's places by weight. Intensities are scaled so the
 * densest place of the year reads as 1.
 */
export function densityField(options: {
  year: number;
  erasConfig: EraConfig[];
  placesConfig: Record<RegionId, PlaceConfig[]>;
  viewport: Viewport;
}): DensityBlob[] {
  const { year, erasConfig, placesConfig, viewport } = options;
  const era = eraFor({ year, erasConfig });
  const sharesTotal = REGION_IDS.reduce((sum, id) => sum + era.shares[id], 0);

  const blobs = REGION_IDS.flatMap((regionId) => {
    const places = placesConfig[regionId];
    const weightTotal = places.reduce((sum, place) => sum + place.weight, 0);
    const regionShare = era.shares[regionId] / sharesTotal;

    return places.map((place) => ({
      id: place.name,
      ...project({ lon: place.lon, lat: place.lat, viewport }),
      intensity: regionShare * (place.weight / weightTotal),
    }));
  });

  const peak = Math.max(...blobs.map((blob) => blob.intensity));
  return blobs.map((blob) => ({ ...blob, intensity: blob.intensity / peak }));
}
