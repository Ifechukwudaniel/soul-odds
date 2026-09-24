import { worldPopCurve } from '@/lib/mortal-odds/config';
import { interpolate } from '@/lib/mortal-odds/curves';
import { populationFromCountries } from '@/lib/mortal-odds/density';
import type { LandByCountry } from '@/lib/mortal-odds/density';
import { fmtPeople, fmtYear } from '@/lib/mortal-odds/format';
import overridesFile from '../../../cliopatria.geojson/cliopatria-population-overrides.json';
import populationFile from '../../../cliopatria.geojson/cliopatria-population.json';

// The estimates are built by `scripts/build-cliopatria-population.ts`: one row per Cliopatria polity
// over the years it held one territory. `method` says where the number came from: "seshat" (a
// researched figure for exactly that row), "seshat_scaled" (a researched figure for the same polity
// at a nearby date, scaled to this row's territory), "imputed" (typical density of nearby polities
// in time and place, capped and kept under the world population) or "llm" (a model's estimate for
// a fixed window of years, checked against the territory's area and the world population; built by
// `scripts/regenerate-cliopatria-population.ts`) or "density" (each modern country's density that year, from Our World in Data's long-run population
// series, times the land the polity covers in it; see `lib/mortal-odds/density.ts`, written by
// `scripts/build-country-population.ts`). A "manual" row is one corrected by hand in
// `cliopatria.geojson/cliopatria-population-overrides.json`, a list of
// `{ "name": "Principality of Peremyshl", "fromYear": 1031, "toYear": 1146, "population": 150000 }`
// entries applied on top of whatever was generated, so regenerating never loses a correction.
// `low` and `high` are optional and default to `population`; `fromYear`/`toYear` are optional
// and default to every row of that name; an entry corrects each row of that name it overlaps.

export type PopulationMethod =
  | 'seshat'
  | 'seshat_scaled'
  | 'imputed'
  | 'llm'
  | 'density'
  | 'manual';

export type PopulationRow = {
  name: string;
  fromYear: number;
  toYear: number;
  wikidata: string;
  seshatId: string;
  areaKm2: number;
  population: number;
  low: number;
  high: number;
  method: PopulationMethod;
  /** The land the territory covers in each modern country, which a "density" row is worked out from; absent on rows that only carry a figure. */
  landByCountry?: LandByCountry;
};

export type PopulationEstimate = {
  empire: string;
  year: number;
  population: number;
  low: number;
  high: number;
  method: PopulationMethod;
  areaKm2: number;
  fromYear: number;
  toYear: number;
  wikidata: string | null;
  seshatId: string | null;
};

/** A row longer than this is scaled with world population over its span, so one figure isn't held flat for centuries. */
const LONG_ROW_YEARS = 50;
const MAX_TIME_SCALE = 4;

function isMethod(value: unknown): value is PopulationMethod {
  return (
    value === 'seshat' ||
    value === 'seshat_scaled' ||
    value === 'imputed' ||
    value === 'llm' ||
    value === 'density' ||
    value === 'manual'
  );
}

/** Reads "41:1200000,7:300000" (country index: land km²) back into a record. */
function parseLandByCountry(value: unknown): LandByCountry | undefined {
  if (typeof value !== 'string' || value === '') return undefined;
  return Object.fromEntries(
    value
      .split(',')
      .map((part) => part.split(':').map(Number))
      .flatMap(([country, km2]) =>
        country !== undefined && km2 !== undefined ? [[country, km2]] : [],
      ),
  );
}

function toRow(values: (string | number)[]): PopulationRow[] {
  const [
    name,
    fromYear,
    toYear,
    wikidata,
    seshatId,
    areaKm2,
    population,
    low,
    high,
    method,
    countries,
  ] = values;
  if (
    typeof name === 'string' &&
    typeof fromYear === 'number' &&
    typeof toYear === 'number' &&
    typeof wikidata === 'string' &&
    typeof seshatId === 'string' &&
    typeof areaKm2 === 'number' &&
    typeof population === 'number' &&
    typeof low === 'number' &&
    typeof high === 'number' &&
    isMethod(method)
  ) {
    return [
      {
        name,
        fromYear,
        toYear,
        wikidata,
        seshatId,
        areaKm2,
        population,
        low,
        high,
        method,
        ...(parseLandByCountry(countries) && { landByCountry: parseLandByCountry(countries) }),
      },
    ];
  }
  return [];
}

export type PopulationOverride = {
  name: string;
  fromYear?: number;
  toYear?: number;
  population: number;
  low?: number;
  high?: number;
};

/** Replaces the figures of every row an override names and overlaps with the hand-corrected ones. */
export function applyOverrides(
  rows: PopulationRow[],
  overrides: PopulationOverride[],
): PopulationRow[] {
  return rows.map((row) => {
    const match = overrides.findLast(
      (o) =>
        o.name.trim().toLowerCase() === row.name.trim().toLowerCase() &&
        (o.fromYear ?? -Infinity) <= row.toYear &&
        (o.toYear ?? Infinity) >= row.fromYear,
    );
    return match
      ? {
          ...row,
          population: match.population,
          low: match.low ?? match.population,
          high: match.high ?? match.population,
          method: 'manual',
        }
      : row;
  });
}

const ROWS = applyOverrides(populationFile.rows.flatMap(toRow), overridesFile);

/** Rows drawn in parentheses ("(Holy Roman Empire)") repeat another row's territory. */
const isDuplicate = (row: PopulationRow) => row.name.startsWith('(');

const normalize = (name: string) => name.trim().toLowerCase();

function scaleForYear(row: PopulationRow, year: number): number {
  if (row.toYear - row.fromYear < LONG_ROW_YEARS) return 1;
  const atYear = interpolate({ points: worldPopCurve, x: year });
  const atRowMiddle = interpolate({ points: worldPopCurve, x: (row.fromYear + row.toYear) / 2 });
  return Math.min(MAX_TIME_SCALE, Math.max(1 / MAX_TIME_SCALE, atYear / atRowMiddle));
}

/**
 * The row's figures for one year. A density row is worked out from the density of each modern country it
 * covers in that exact year times the land it covers there, keeping the spread its low and high had around the stored figure; any other row
 * (researched, hand-corrected, or without a country breakdown) scales its stored figure with world population.
 */
function figuresFor(
  row: PopulationRow,
  year: number,
): Pick<PopulationEstimate, 'population' | 'low' | 'high'> {
  if (row.method === 'density' && row.landByCountry && row.population > 0) {
    const population = populationFromCountries({ year, landByCountry: row.landByCountry });
    // The stored spread came from figures that don't always straddle their best estimate, so keep low <= mid <= high and within 5x.
    const lowRatio = Math.min(1, Math.max(0.25, row.low / row.population));
    const highRatio = Math.max(1, Math.min(4, row.high / row.population));
    return {
      population: Math.round(population),
      low: Math.round(population * lowRatio),
      high: Math.round(population * highRatio),
    };
  }
  const scale = scaleForYear(row, year);
  return {
    population: Math.round(row.population * scale),
    low: Math.round(row.low * scale),
    high: Math.round(row.high * scale),
  };
}

function toEstimate(row: PopulationRow, year: number): PopulationEstimate {
  return {
    empire: row.name,
    year,
    ...figuresFor(row, year),
    method: row.method,
    areaKm2: row.areaKm2,
    fromYear: row.fromYear,
    toYear: row.toYear,
    wikidata: row.wikidata || null,
    seshatId: row.seshatId || null,
  };
}

const covers = (row: PopulationRow, year: number) => row.fromYear <= year && year <= row.toYear;

/**
 * Prefers the exact name (any case), then names that contain the query; the shortest name wins so "Rome" finds "Rome" before "Roman Empire".
 * When the exact name exists but not in `year`, the same name in parentheses is tried, which is how Cliopatria lists a
 * territory that another polity's row repeats, so "British Empire" finds "(British Empire)" in 1900.
 */
function rowsNamed(query: string, year: number): PopulationRow[] {
  const wanted = normalize(query);
  const exact = ROWS.filter((row) => normalize(row.name) === wanted);
  if (exact.length > 0) {
    const repeated = ROWS.filter((row) => normalize(row.name) === `(${wanted})`);
    return exact.some((row) => covers(row, year)) ? exact : repeated;
  }
  return ROWS.filter((row) => normalize(row.name).includes(wanted)).sort(
    (a, b) => a.name.length - b.name.length,
  );
}

/**
 * The estimated population of one empire (or any Cliopatria polity) in one year.
 * @param options.empire The polity's name, matched case-insensitively.
 * @param options.wikidata A Wikidata id such as "Q2277", used instead of a name when given.
 * @param options.year The year, negative for BCE.
 * @returns The estimate, or null when nothing by that name existed in that year.
 */
export function estimatePopulation(options: {
  empire?: string;
  wikidata?: string;
  year: number;
}): PopulationEstimate | null {
  const { empire, wikidata, year } = options;
  const candidates = wikidata
    ? ROWS.filter((row) => row.wikidata === wikidata)
    : empire
      ? rowsNamed(empire, year)
      : [];
  const alive = candidates.filter((row) => covers(row, year));
  const [best] = (
    alive.some((row) => !isDuplicate(row)) ? alive.filter((row) => !isDuplicate(row)) : alive
  ).sort((a, b) => b.areaKm2 - a.areaKm2);
  return best ? toEstimate(best, year) : null;
}

/**
 * One line saying how many people lived in an empire at that time, e.g. "Roman Empire, 100 CE: about 55 million people lived here."
 * Takes the same options as `estimatePopulation`; null when nothing by that name existed in that year.
 */
export function describePopulation(options: {
  empire?: string;
  wikidata?: string;
  year: number;
}): string | null {
  const estimate = estimatePopulation(options);
  return estimate
    ? `${estimate.empire}, ${fmtYear(options.year)}: about ${fmtPeople(estimate.population)} people lived here.`
    : null;
}

/** Every polity alive in a year with its estimate, most populous first. Duplicate rows are left out. */
export function estimatesAt(year: number): PopulationEstimate[] {
  return ROWS.filter((row) => covers(row, year) && !isDuplicate(row))
    .map((row) => toEstimate(row, year))
    .sort((a, b) => b.population - a.population);
}
