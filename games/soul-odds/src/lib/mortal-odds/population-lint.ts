/** Densest a whole polity's territory averages before 1800, in people per km²; matches the cap the imputed rows have always used. */
export const MAX_DENSITY_PER_KM2 = 300;

/** From 1800 on, industrial-era countries and city-states (the Netherlands, Singapore, Monaco) far exceed the old cap. */
const MODERN_FROM = 1800;
const MAX_MODERN_DENSITY_PER_KM2 = 25_000;

/** No single polity held more than this share of the world's people. */
export const MAX_WORLD_SHARE = 0.5;

/** How far the low and high figures may sit from the best estimate, as a multiple. */
const MAX_RANGE_FACTOR = 5;

export type PopulationRange = { low: number; mid: number; high: number };

/** What is wrong with a population estimate for a territory of `areaKm2` in `year`, when `world` people were alive, or null when it is plausible. */
export function checkPopulation(options: { estimate: PopulationRange; areaKm2: number; world: number; year: number }): string | null {
  const { estimate, areaKm2, world, year } = options;
  const maxDensity = year < MODERN_FROM ? MAX_DENSITY_PER_KM2 : MAX_MODERN_DENSITY_PER_KM2;
  const { low, mid, high } = estimate;

  if (!(low <= mid && mid <= high)) return `low, mid and high must be in ascending order, got ${low}, ${mid}, ${high}`;
  if (low < mid / MAX_RANGE_FACTOR || high > mid * MAX_RANGE_FACTOR) return `the range must stay within ${MAX_RANGE_FACTOR}x of the best estimate`;
  if (areaKm2 > 0 && mid / areaKm2 > maxDensity) return `${Math.round(mid / areaKm2)} people per km² is denser than any territory averaged`;
  if (mid > world * MAX_WORLD_SHARE) return `${mid} is more than ${MAX_WORLD_SHARE * 100}% of the ${Math.round(world)} people alive in the world then`;
  return null;
}

type CalibratedRow = { name: string; fromYear: number; toYear: number; population: number; low: number; high: number; method: string };

/** Rows drawn in parentheses ("(Holy Roman Empire)") repeat another row's territory, so they don't count toward a year's total. */
const isDuplicate = (row: CalibratedRow) => row.name.startsWith("(");

/**
 * Scales estimated rows down wherever the polities alive in their middle year would outnumber
 * everyone alive then. Researched (Seshat) rows are never touched.
 */
export function calibrateToWorld<T extends CalibratedRow>(rows: T[], worldAt: (year: number) => number): T[] {
  const counted = rows.filter((row) => !isDuplicate(row));
  return rows.map((row) => {
    if (row.method !== "llm") return row;
    const midYear = (row.fromYear + row.toYear) / 2;
    const total = counted.filter((other) => other.fromYear <= midYear && midYear <= other.toYear).reduce((sum, other) => sum + other.population, 0);
    const world = worldAt(midYear);
    const factor = total > world ? world / total : 1;
    return factor === 1 ? row : { ...row, population: Math.round(row.population * factor), low: Math.round(row.low * factor), high: Math.round(row.high * factor) };
  });
}
