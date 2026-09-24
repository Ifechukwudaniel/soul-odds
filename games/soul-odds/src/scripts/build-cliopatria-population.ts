import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { centroidOf, loadCliopatria } from '@/lib/mortal-odds/cliopatria';
import { worldPopCurve } from '@/lib/mortal-odds/config';
import { interpolate } from '@/lib/mortal-odds/curves';

// ✦ Builds cliopatria.geojson/cliopatria_population.csv and cliopatria.geojson/cliopatria-population.json:
//   one population estimate per Cliopatria row (a polity over the years it held one territory), keyed by
//   (Name, FromYear, ToYear). The JSON is what `lib/mortal-odds/population-estimate.ts` and the population API read.
//
//   Seshat (the project Cliopatria belongs to) publishes hand-researched polity populations for
//   ~250 of Cliopatria's ~1,600 polities. Where a row has one within MAX_GAP_YEARS, the estimate is
//   carried over as a density (people per km²) and scaled to that row's territory, so a polity that
//   grew or shrank keeps a sensible figure. Every other row is imputed from the densities of the
//   nearest Seshat-covered rows in time and place, capped at MAX_IMPUTED_DENSITY and scaled down wherever
//   the polities alive in a year would otherwise add up to more than the world population that year.
//   The Method column says which one each row got.

const SESHAT_URL = 'https://seshat-db.com/api/sc/polity-populations/?format=json&page_size=200';
const CSV_PATH = path.join(process.cwd(), 'cliopatria.geojson', 'cliopatria_population.csv');
const JSON_PATH = path.join(process.cwd(), 'cliopatria.geojson', 'cliopatria-population.json');
const MAX_GAP_YEARS = 200;
const NEIGHBOURS = 10;
const MAX_IMPUTED_DENSITY = 300;
// ✦ One unit of distance = this many years, or this many degrees, so 150 years counts like 8 degrees (~900 km).
const YEARS_PER_UNIT = 150;
const DEGREES_PER_UNIT = 8;

type SeshatRecord = {
  polity: { name: string; start_year: number | null; end_year: number | null };
  year_from: number | null;
  year_to: number | null;
  polity_population_from: number | null;
  polity_population_to: number | null;
};

type Observation = { year: number; low: number; high: number };

type Row = {
  name: string;
  fromYear: number;
  toYear: number;
  midYear: number;
  wikidata: string;
  seshatId: string;
  area: number;
  lat: number;
  lon: number;
  density?: { low: number; mid: number; high: number };
  method?: 'seshat' | 'seshat_scaled' | 'imputed';
  gap: number;
};

async function fetchSeshat(): Promise<SeshatRecord[]> {
  const records: SeshatRecord[] = [];
  let url: string | null = SESHAT_URL;
  while (url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Seshat request failed: ${response.status}`);
    const page = (await response.json()) as { next: string | null; results: SeshatRecord[] };
    records.push(...page.results);
    url = page.next;
  }
  return records;
}

const midpoint = (a: number, b: number) => (a + b) / 2;

function observationsByPolity(records: SeshatRecord[]): Map<string, Observation[]> {
  const byPolity = new Map<string, Observation[]>();
  for (const record of records) {
    const low = record.polity_population_from ?? record.polity_population_to;
    const high = record.polity_population_to ?? record.polity_population_from;
    if (low === null || high === null || low <= 0) continue;

    const { start_year: start, end_year: end } = record.polity;
    const from = record.year_from ?? start;
    const to = record.year_to ?? end;
    if (from === null || to === null) continue;

    const list = byPolity.get(record.polity.name) ?? [];
    list.push({ year: midpoint(from, to), low, high });
    byPolity.set(record.polity.name, list);
  }
  return byPolity;
}

function percentile(sorted: number[], fraction: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))] ?? 0;
}

function distance(a: Row, b: Row): number {
  const cosLat = Math.cos((midpoint(a.lat, b.lat) * Math.PI) / 180);
  return Math.hypot(
    (a.midYear - b.midYear) / YEARS_PER_UNIT,
    (a.lat - b.lat) / DEGREES_PER_UNIT,
    ((a.lon - b.lon) * cosLat) / DEGREES_PER_UNIT,
  );
}

function applySeshat(rows: Row[], observations: Map<string, Observation[]>) {
  for (const row of rows) {
    const candidates = observations.get(row.seshatId);
    if (!candidates) continue;

    const gapOf = (year: number) =>
      year < row.fromYear ? row.fromYear - year : year > row.toYear ? year - row.toYear : 0;
    const nearest = candidates.reduce((best, candidate) =>
      gapOf(candidate.year) < gapOf(best.year) ? candidate : best,
    );
    const gap = gapOf(nearest.year);
    if (gap > MAX_GAP_YEARS) continue;

    // ✦ The observation is for the whole polity at its own year, so its territory is the biggest row of that
    //   polity around then (other rows sharing the ID are components or duplicates). Turn it into a density
    //   over that territory, then apply it to this row's own area.
    const gapTo = (r: Row) =>
      nearest.year < r.fromYear
        ? r.fromYear - nearest.year
        : nearest.year > r.toYear
          ? nearest.year - r.toYear
          : 0;
    const anchor = rows
      .filter((other) => other.seshatId === row.seshatId)
      .reduce((best, other) =>
        gapTo(other) < gapTo(best) || (gapTo(other) === gapTo(best) && other.area > best.area)
          ? other
          : best,
      );
    if (anchor.area <= 0) continue;

    row.density = {
      low: nearest.low / anchor.area,
      mid: midpoint(nearest.low, nearest.high) / anchor.area,
      high: nearest.high / anchor.area,
    };
    row.method = gap === 0 && anchor === row ? 'seshat' : 'seshat_scaled';
    row.gap = gap;
  }
}

function imputeRest(rows: Row[]) {
  const covered = rows.filter((row) => row.density);
  for (const row of rows) {
    if (row.density) continue;
    const nearest = covered
      .map((other) => ({ other, d: distance(row, other) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, NEIGHBOURS);
    const lows = nearest.map(({ other }) => other.density!.low).sort((a, b) => a - b);
    const mids = nearest.map(({ other }) => other.density!.mid).sort((a, b) => a - b);
    const highs = nearest.map(({ other }) => other.density!.high).sort((a, b) => a - b);
    row.density = {
      low: Math.min(MAX_IMPUTED_DENSITY, percentile(lows, 0.25)),
      mid: Math.min(MAX_IMPUTED_DENSITY, percentile(mids, 0.5)),
      high: Math.min(MAX_IMPUTED_DENSITY, percentile(highs, 0.75)),
    };
    row.method = 'imputed';
  }
}

/** Rows drawn in parentheses duplicate another row's territory, so they don't count toward a year's total. */
const isDuplicate = (row: Row) => row.name.startsWith('(');

/** Scales imputed rows down where the polities alive in their year would outnumber everyone alive then. */
function calibrateToWorldPopulation(rows: Row[]) {
  const counted = rows.filter((row) => !isDuplicate(row));
  for (const row of rows) {
    if (row.method !== 'imputed') continue;
    const total = counted
      .filter((other) => other.fromYear <= row.midYear && row.midYear <= other.toYear)
      .reduce((sum, other) => sum + other.density!.mid * other.area, 0);
    const world = interpolate({ points: worldPopCurve, x: row.midYear });
    const factor = total > world ? world / total : 1;
    row.density = {
      low: row.density!.low * factor,
      mid: row.density!.mid * factor,
      high: row.density!.high * factor,
    };
  }
}

const csvCell = (value: string | number) =>
  typeof value === 'string' && /[",\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : String(value);

async function main() {
  const features = await loadCliopatria();
  const rows: Row[] = features.map((feature) => {
    const { lat, lon } = centroidOf(feature);
    const { Name, FromYear, ToYear, Wikidata, SeshatID, Area } = feature.properties;
    return {
      name: Name,
      fromYear: FromYear,
      toYear: ToYear,
      midYear: midpoint(FromYear, ToYear),
      wikidata: Wikidata,
      seshatId: SeshatID,
      area: Area,
      lat,
      lon,
      gap: 0,
    };
  });

  applySeshat(rows, observationsByPolity(await fetchSeshat()));
  imputeRest(rows);
  calibrateToWorldPopulation(rows);

  const header =
    'Name,FromYear,ToYear,Wikidata,SeshatID,AreaKm2,Population,PopulationLow,PopulationHigh,DensityPerKm2,Method,SourceYearGap';
  const lines = rows.map((row) => {
    const density = row.density!;
    return [
      row.name,
      row.fromYear,
      row.toYear,
      row.wikidata,
      row.seshatId,
      Math.round(row.area),
      Math.round(density.mid * row.area),
      Math.round(density.low * row.area),
      Math.round(density.high * row.area),
      density.mid.toFixed(3),
      row.method!,
      Math.round(row.gap),
    ]
      .map(csvCell)
      .join(',');
  });
  await writeFile(CSV_PATH, `${header}\n${lines.join('\n')}\n`);
  await writeFile(
    JSON_PATH,
    JSON.stringify({
      columns: [
        'name',
        'fromYear',
        'toYear',
        'wikidata',
        'seshatId',
        'areaKm2',
        'population',
        'low',
        'high',
        'method',
      ],
      rows: rows.map((row) => [
        row.name,
        row.fromYear,
        row.toYear,
        row.wikidata,
        row.seshatId,
        Math.round(row.area),
        Math.round(row.density!.mid * row.area),
        Math.round(row.density!.low * row.area),
        Math.round(row.density!.high * row.area),
        row.method,
      ]),
    }),
  );

  const counts = rows.reduce<Record<string, number>>(
    (acc, row) => ({ ...acc, [row.method!]: (acc[row.method!] ?? 0) + 1 }),
    {},
  );
  console.log(`Wrote ${rows.length} rows to ${CSV_PATH} and ${JSON_PATH}`, counts);
  for (const year of [-3000, -1000, -500, 1, 500, 1000, 1500, 1800, 1900, 2000]) {
    const total = rows
      .filter((row) => row.fromYear <= year && year <= row.toYear)
      .reduce((sum, row) => sum + row.density!.mid * row.area, 0);
    console.log(`  year ${year}: rows sum to ${(total / 1e6).toFixed(0)}M`);
  }
}

main();
