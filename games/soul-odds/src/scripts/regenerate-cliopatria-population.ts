import fs from 'node:fs';
import path from 'node:path';
import { buildWindowJobs } from '@/lib/mortal-odds/cliopatria-windows';
import type { WindowJob } from '@/lib/mortal-odds/cliopatria-windows';
import { worldPopCurve } from '@/lib/mortal-odds/config';
import { interpolate } from '@/lib/mortal-odds/curves';
import { generatePopulationEstimate } from '@/lib/mortal-odds/openrouter';
import { calibrateToWorld } from '@/lib/mortal-odds/population-lint';
import { periodOf } from '@/lib/mortal-odds/sin-variants';

/**
 * Regenerates the Cliopatria population estimates with the same fixed windows as the sin catalog
 * (see `periodOf`), writing `cliopatria-population.next.json` for review before it replaces
 * `cliopatria-population.json`. Each polity gets one row per window its span touches:
 *  - a window a researched (Seshat) figure already falls in takes that figure's density, applied to
 *    the territory held then, and needs no request;
 *  - every other window is estimated by a model, anchored by the nearest researched figure for the
 *    polity when there is one, and checked against the territory's area and the world population
 *    (see `checkPopulation`);
 *  - a last pass scales estimates down wherever a year's polities would outnumber the world.
 * Resumable: re-running only estimates the windows missing from the output file. Pass `--dry` to just count the work.
 */

const DATA_DIR = path.join(process.cwd(), 'cliopatria.geojson');
const CURRENT_FILE = path.join(DATA_DIR, 'cliopatria-population.json');
const OUT_FILE = path.join(DATA_DIR, 'cliopatria-population.next.json');
// ✦ Each request takes seconds to answer, so throughput comes from running many at once.
const CONCURRENCY = 30;
const SAVE_EVERY = 25;
// ✦ Cheap but knows enough history: on the polities tried it put the Roman Empire near the researched
//   figure, where the default model and gpt-4o-mini came out several times too low, and it returns plain JSON.
const POPULATION_MODEL = 'google/gemini-2.5-flash';
// ✦ A researched figure this many years from a window is too far to anchor an estimate.
const MAX_REFERENCE_GAP_YEARS = 300;

const COLUMNS = [
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
] as const;
type Method = 'seshat' | 'seshat_scaled' | 'llm';
type Row = {
  name: string;
  fromYear: number;
  toYear: number;
  wikidata: string;
  seshatId: string;
  areaKm2: number;
  population: number;
  low: number;
  high: number;
  method: string;
};
type Researched = {
  fromYear: number;
  toYear: number;
  areaKm2: number;
  population: number;
  low: number;
  high: number;
};

/** A row is identified by its polity and the fixed window it falls in, however far the polity's own span clips it. */
const keyOf = (name: string, fromYear: number) => `${name}|${periodOf(fromYear).fromYear}`;

function readRows(file: string): Row[] {
  if (!fs.existsSync(file)) return [];
  const { rows } = JSON.parse(fs.readFileSync(file, 'utf8')) as { rows: (string | number)[][] };
  return rows.map(
    ([name, fromYear, toYear, wikidata, seshatId, areaKm2, population, low, high, method]) => ({
      name: String(name),
      fromYear: Number(fromYear),
      toYear: Number(toYear),
      wikidata: String(wikidata),
      seshatId: String(seshatId),
      areaKm2: Number(areaKm2),
      population: Number(population),
      low: Number(low),
      high: Number(high),
      method: String(method),
    }),
  );
}

function writeRows(rows: Row[]) {
  const sorted = [...rows].sort((a, b) => a.fromYear - b.fromYear || a.name.localeCompare(b.name));
  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({
      columns: COLUMNS,
      rows: sorted.map((row) => COLUMNS.map((column) => row[column])),
    }),
  );
}

/** The researched rows (Seshat, or scaled from it) already in the current file, by polity name. */
function researchedByName(): Map<string, Researched[]> {
  const byName = new Map<string, Researched[]>();
  for (const row of readRows(CURRENT_FILE)) {
    if (row.method !== 'seshat' && row.method !== 'seshat_scaled') continue;
    byName.set(row.name, [...(byName.get(row.name) ?? []), row]);
  }
  return byName;
}

const gapTo = (row: Researched, year: number) =>
  year < row.fromYear ? row.fromYear - year : year > row.toYear ? year - row.toYear : 0;

/** The researched row nearest `year`, or undefined when the polity has none. */
function nearest(rows: Researched[] | undefined, year: number): Researched | undefined {
  return rows?.reduce<Researched | undefined>(
    (best, row) => (!best || gapTo(row, year) < gapTo(best, year) ? row : best),
    undefined,
  );
}

/** A researched figure's density applied to this window's territory. */
function scaledFrom(
  reference: Researched,
  job: WindowJob,
): Pick<Row, 'population' | 'low' | 'high' | 'method'> {
  const factor = job.areaKm2 / reference.areaKm2;
  const exact = reference.areaKm2 === job.areaKm2;
  return {
    population: Math.round(reference.population * factor),
    low: Math.round(reference.low * factor),
    high: Math.round(reference.high * factor),
    method: exact ? 'seshat' : 'seshat_scaled',
  };
}

/** The years in the window the polity actually existed, so a row never counts a polity outside its own lifetime. */
const lifetimeIn = (job: WindowJob) => ({
  fromYear: Math.max(job.window.fromYear, job.place.fromYear),
  toYear: Math.min(job.window.toYear, job.place.toYear),
});

const rowFor = (
  job: WindowJob,
  figures: Pick<Row, 'population' | 'low' | 'high' | 'method'>,
): Row => ({
  name: job.name,
  ...lifetimeIn(job),
  wikidata: job.wikidata,
  seshatId: job.seshatId,
  areaKm2: Math.round(job.areaKm2),
  ...figures,
});

async function main() {
  const jobs = await buildWindowJobs();
  const researched = researchedByName();
  const jobByKey = new Map(jobs.map((job) => [keyOf(job.name, job.window.fromYear), job]));
  // ✦ Rows saved before clipping ran cover the whole window, so clip every loaded row to its polity's lifetime.
  const done = new Map(
    readRows(OUT_FILE).flatMap((row): [string, Row][] => {
      const job = jobByKey.get(keyOf(row.name, row.fromYear));
      return job ? [[keyOf(row.name, row.fromYear), { ...row, ...lifetimeIn(job) }]] : [];
    }),
  );

  // ✦ A researched figure whose own dates overlap the window answers it outright; the rest need a model.
  const direct = new Map<WindowJob, Researched>();
  for (const job of jobs) {
    const overlapping = researched
      .get(job.name)
      ?.filter((row) => row.fromYear <= job.window.toYear && row.toYear >= job.window.fromYear);
    const best = nearest(overlapping, job.year);
    if (best) direct.set(job, best);
  }
  const remaining = jobs.filter((job) => !done.has(keyOf(job.name, job.window.fromYear)));

  console.log(
    `${jobs.length} windows across ${new Set(jobs.map((job) => job.name)).size} polities: ${direct.size} from researched figures, ${jobs.length - direct.size} for a model. ${jobs.length - remaining.length} already done, ${remaining.length} to do.`,
  );
  if (process.argv.includes('--dry')) return;

  let completed = 0;
  let failed = 0;
  const save = () => writeRows([...done.values()]);

  const queue = [...remaining];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        const reference = direct.get(job);
        const anchor = nearest(researched.get(job.name), job.year);
        const figures =
          reference !== undefined
            ? scaledFrom(reference, job)
            : {
                ...(await generatePopulationEstimate({
                  name: job.name,
                  year: job.year,
                  place: job.place,
                  areaKm2: job.areaKm2,
                  world: interpolate({ points: worldPopCurve, x: job.year }),
                  model: POPULATION_MODEL,
                  reference:
                    anchor && gapTo(anchor, job.year) <= MAX_REFERENCE_GAP_YEARS
                      ? {
                          year: (anchor.fromYear + anchor.toYear) / 2,
                          population: anchor.population,
                          areaKm2: anchor.areaKm2,
                        }
                      : undefined,
                })),
                method: 'llm' satisfies Method,
              };
        const row = rowFor(
          job,
          'mid' in figures
            ? {
                population: figures.mid,
                low: figures.low,
                high: figures.high,
                method: figures.method,
              }
            : figures,
        );
        done.set(keyOf(row.name, row.fromYear), row);
      } catch (error) {
        failed += 1;
        console.error(
          `failed for "${job.name}" (${job.year}):`,
          error instanceof Error ? error.message : error,
        );
      }
      completed += 1;
      if (completed % SAVE_EVERY === 0) {
        save();
        console.log(`${completed}/${remaining.length} done (${failed} failed so far)`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const calibrated = calibrateToWorld([...done.values()], (year) =>
    interpolate({ points: worldPopCurve, x: year }),
  );
  done.clear();
  for (const row of calibrated) done.set(keyOf(row.name, row.fromYear), row);
  save();

  console.log(
    `Done. ${remaining.length - failed} windows estimated, ${failed} failed. Wrote ${OUT_FILE}`,
  );
  for (const year of [-3000, -1000, 1, 500, 1000, 1500, 1800, 1900, 2000]) {
    const total = calibrated
      .filter((row) => !row.name.startsWith('(') && row.fromYear <= year && year <= row.toYear)
      .reduce((sum, row) => sum + row.population, 0);
    console.log(
      `  year ${year}: rows sum to ${(total / 1e6).toFixed(0)}M (world ${(interpolate({ points: worldPopCurve, x: year }) / 1e6).toFixed(0)}M)`,
    );
  }
}

main().then(() => process.exit(0));
