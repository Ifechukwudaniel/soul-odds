import populationFile from "../../../cliopatria.geojson/cliopatria-population.json";
import { worldPopCurve } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { fmtPeople, fmtYear } from "@/lib/mortal-odds/format";

// The estimates are built by `scripts/build-cliopatria-population.ts`: one row per Cliopatria polity
// over the years it held one territory. `method` says where the number came from: "seshat" (a
// researched figure for exactly that row), "seshat_scaled" (a researched figure for the same polity
// at a nearby date, scaled to this row's territory), "imputed" (typical density of nearby polities
// in time and place, capped and kept under the world population) or "llm" (a model's estimate for
// a fixed window of years, checked against the territory's area and the world population; built by
// `scripts/regenerate-cliopatria-population.ts`).

export type PopulationMethod = "seshat" | "seshat_scaled" | "imputed" | "llm";

type PopulationRow = {
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
  return value === "seshat" || value === "seshat_scaled" || value === "imputed" || value === "llm";
}

function toRow(values: (string | number)[]): PopulationRow[] {
  const [name, fromYear, toYear, wikidata, seshatId, areaKm2, population, low, high, method] = values;
  if (
    typeof name === "string" &&
    typeof fromYear === "number" &&
    typeof toYear === "number" &&
    typeof wikidata === "string" &&
    typeof seshatId === "string" &&
    typeof areaKm2 === "number" &&
    typeof population === "number" &&
    typeof low === "number" &&
    typeof high === "number" &&
    isMethod(method)
  ) {
    return [{ name, fromYear, toYear, wikidata, seshatId, areaKm2, population, low, high, method }];
  }
  return [];
}

const ROWS = populationFile.rows.flatMap(toRow);

/** Rows drawn in parentheses ("(Holy Roman Empire)") repeat another row's territory. */
const isDuplicate = (row: PopulationRow) => row.name.startsWith("(");

const normalize = (name: string) => name.trim().toLowerCase();

function scaleForYear(row: PopulationRow, year: number): number {
  if (row.toYear - row.fromYear < LONG_ROW_YEARS) return 1;
  const atYear = interpolate({ points: worldPopCurve, x: year });
  const atRowMiddle = interpolate({ points: worldPopCurve, x: (row.fromYear + row.toYear) / 2 });
  return Math.min(MAX_TIME_SCALE, Math.max(1 / MAX_TIME_SCALE, atYear / atRowMiddle));
}

function toEstimate(row: PopulationRow, year: number): PopulationEstimate {
  const scale = scaleForYear(row, year);
  return {
    empire: row.name,
    year,
    population: Math.round(row.population * scale),
    low: Math.round(row.low * scale),
    high: Math.round(row.high * scale),
    method: row.method,
    areaKm2: row.areaKm2,
    fromYear: row.fromYear,
    toYear: row.toYear,
    wikidata: row.wikidata || null,
    seshatId: row.seshatId || null,
  };
}

const covers = (row: PopulationRow, year: number) => row.fromYear <= year && year <= row.toYear;

/** Prefers the exact name (any case), then names that contain the query; the shortest name wins so "Rome" finds "Rome" before "Roman Empire". */
function rowsNamed(query: string): PopulationRow[] {
  const wanted = normalize(query);
  const exact = ROWS.filter((row) => normalize(row.name) === wanted);
  if (exact.length > 0) return exact;
  return ROWS.filter((row) => normalize(row.name).includes(wanted)).sort((a, b) => a.name.length - b.name.length);
}

/**
 * The estimated population of one empire (or any Cliopatria polity) in one year.
 * @param options.empire The polity's name, matched case-insensitively.
 * @param options.wikidata A Wikidata id such as "Q2277", used instead of a name when given.
 * @param options.year The year, negative for BCE.
 * @returns The estimate, or null when nothing by that name existed in that year.
 */
export function estimatePopulation(options: { empire?: string; wikidata?: string; year: number }): PopulationEstimate | null {
  const { empire, wikidata, year } = options;
  const candidates = wikidata ? ROWS.filter((row) => row.wikidata === wikidata) : empire ? rowsNamed(empire) : [];
  const alive = candidates.filter((row) => covers(row, year));
  const [best] = (alive.some((row) => !isDuplicate(row)) ? alive.filter((row) => !isDuplicate(row)) : alive).sort((a, b) => b.areaKm2 - a.areaKm2);
  return best ? toEstimate(best, year) : null;
}

/**
 * One line saying how many people lived in an empire at that time, e.g. "Roman Empire, 100 CE: about 55 million people lived here."
 * Takes the same options as `estimatePopulation`; null when nothing by that name existed in that year.
 */
export function describePopulation(options: { empire?: string; wikidata?: string; year: number }): string | null {
  const estimate = estimatePopulation(options);
  return estimate ? `${estimate.empire}, ${fmtYear(options.year)}: about ${fmtPeople(estimate.population)} people lived here.` : null;
}

/** Every polity alive in a year with its estimate, most populous first. Duplicate rows are left out. */
export function estimatesAt(year: number): PopulationEstimate[] {
  return ROWS.filter((row) => covers(row, year) && !isDuplicate(row))
    .map((row) => toEstimate(row, year))
    .sort((a, b) => b.population - a.population);
}
