import type { EraConfig, PlaceConfig } from '@/lib/mortal-odds/config';
import { HUMANS_EVER, MODES } from '@/lib/mortal-odds/config';
import { interpolate } from '@/lib/mortal-odds/curves';
import {
  fmtNumber,
  fmtPeople,
  fmtPeopleRounded,
  fmtYear,
  periodName,
} from '@/lib/mortal-odds/format';
import { eraFor } from '@/lib/mortal-odds/geo';
import { pickWeighted } from '@/lib/mortal-odds/rng';
import type { Rng } from '@/lib/mortal-odds/rng';
import type { Draw, EraFilter, Place, PlaceContext, RegionId } from '@/types';

/**
 * The Cliopatria dataset's last-updated year. A range ending here means "still standing", not
 * dissolved: the dataset simply stops tracking it.
 */
const CLIOPATRIA_DATA_CUTOFF_YEAR = 2023;

/** Phrasings for a real historical polity's attested date range — picked randomly so it doesn't read identically every draw. */
const ENDURED_TEMPLATES: ((from: string, to: string) => string)[] = [
  (from, to) => `This place endured from ${from} to ${to}.`,
  (from, to) => `Its name held on maps from ${from} to ${to}.`,
  (from, to) => `Records name this place from ${from} until ${to}.`,
  (from, to) => `From ${from} to ${to}, this land carried that name.`,
  (from, to) => `History remembers this place standing from ${from} to ${to}.`,
];

/** Phrasings for a polity whose attested range runs past the dataset's own cutoff — still standing, not ended. */
const ENDURES_STILL_TEMPLATES: ((from: string) => string)[] = [
  (from) => `This place has endured since ${from}.`,
  (from) => `Its name has held since ${from}.`,
  (from) => `From ${from} to the present day, this land has kept its name.`,
  (from) => `This place has stood since ${from}.`,
  (from) => `Records have named this place since ${from}.`,
];

function pickRandom<T>(items: readonly T[], rng: Rng): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error('pickRandom: items must not be empty');
  return item;
}

export function drawBirth(options: {
  era: EraFilter;
  rng: Rng;
  erasConfig: EraConfig[];
  currentYear: number;
}): {
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
 * Weighted-picks a sub-region place within a region, folding the continent into `name`
 * (`"City, Continent"`) to match the shape of `/api/mortal-odds/place`'s synthetic fallback; see
 * `toPlace` in `place.ts`.
 */
export function pickPlace(options: {
  region: RegionId;
  rng: Rng;
  placesConfig: Record<RegionId, PlaceConfig[]>;
}): Place {
  const { region, rng, placesConfig } = options;
  const candidates = placesConfig[region];
  const picked = pickWeighted({ items: candidates, weight: (p) => p.weight, rng });
  const total = candidates.reduce((sum, p) => sum + p.weight, 0);
  return {
    name: `${picked.name}, ${picked.continent}`,
    share: picked.weight / total,
    lat: picked.lat,
    lon: picked.lon,
  };
}

/** The continent of the configured place nearest a point, for a polity that comes without one. */
export function continentNear(options: {
  lat: number;
  lon: number;
  placesConfig: Record<RegionId, PlaceConfig[]>;
}): string {
  const { lat, lon, placesConfig } = options;
  const rad = Math.PI / 180;
  // ✦ Haversine's `a` grows with distance, which is all that's needed to find the nearest.
  const closeness = (p: PlaceConfig) =>
    Math.sin(((p.lat - lat) * rad) / 2) ** 2 +
    Math.cos(lat * rad) * Math.cos(p.lat * rad) * Math.sin(((p.lon - lon) * rad) / 2) ** 2;
  return Object.values(placesConfig)
    .flat()
    .reduce((nearest, p) => (closeness(p) < closeness(nearest) ? p : nearest)).continent;
}

/** A region's share of births in an already-resolved era, relative to all regions that era. */
export function regionShareInEra(options: { region: RegionId; era: EraConfig }): number {
  const { region, era } = options;
  const total = Object.values(era.shares).reduce((sum, share) => sum + share, 0);
  return era.shares[region] / total;
}

/** The drawn region's share of births in the year's era, relative to all regions that era. */
export function regionShare(options: {
  year: number;
  region: RegionId;
  erasConfig: EraConfig[];
}): number {
  const { year, region, erasConfig } = options;
  return regionShareInEra({ region, era: eraFor({ year, erasConfig }) });
}

/**
 * Builds the place-context text shown with a drawn human: `where` is the header line ("the North
 * China Plain · Asia · 1675 CE") and `local` says how many people lived there.
 * A synthetic pick (`share` set) estimates from its share of the region; a real polity (Cliopatria)
 * uses its own estimate or, lacking one, its attested date range. The year's era comes pre-resolved
 * (backend or local `eraFor`), so this stays agnostic to its source.
 */
export function placeContext(options: {
  draw: Draw;
  era: EraConfig;
  worldPopCurve: ReadonlyArray<readonly [number, number]>;
  currentYear: number;
  rng: Rng;
}): Omit<PlaceContext, 'story'> {
  const { draw, era, worldPopCurve, currentYear, rng } = options;
  const world = interpolate({ points: worldPopCurve, x: draw.year });

  let local = '';
  if (draw.place.share !== undefined) {
    const share = regionShareInEra({ region: draw.region, era });
    local = `This land was home to around ${fmtPeople(world * share * draw.place.share)} people.`;
  } else if (draw.place.population !== undefined) {
    local = `This land was home to around ${fmtPeopleRounded(draw.place.population)} people.`;
  }
   else if (draw.place.fromYear !== undefined && draw.place.toYear !== undefined) {
    local =
      draw.place.toYear >= CLIOPATRIA_DATA_CUTOFF_YEAR
        ? pickRandom(ENDURES_STILL_TEMPLATES, rng)(fmtYear(draw.place.fromYear))
        : pickRandom(ENDURED_TEMPLATES, rng)(
            fmtYear(draw.place.fromYear),
            fmtYear(draw.place.toYear),
          );
  }

  // ✦ A synthetic place's name already ends in its continent ("City, Continent"); a polity's doesn't.
  //   `fmtYear` leaves "CE" off recent years; the header always spells it out.
  const yearLabel = draw.year > 0 ? `${draw.year} CE` : fmtYear(draw.year);
  const where = [
    ...(draw.place.continent
      ? [draw.place.name, draw.place.continent]
      : draw.place.name.split(', ')),
    yearLabel,
  ].join(' · ');

  return {
    where,
    local,
    when: `${fmtNumber(currentYear - draw.year)} years ago, ${periodName(draw.year)}. About ${fmtPeople(world)} people were alive, ${((world / HUMANS_EVER) * 100).toFixed(3)}% of all humans ever.`,
  };
}
