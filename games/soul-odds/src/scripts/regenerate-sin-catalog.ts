import fs from "node:fs";
import path from "node:path";
import { centroidOf, loadCliopatria } from "@/lib/mortal-odds/cliopatria";
import type { CliopatriaFeature } from "@/lib/mortal-odds/cliopatria";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
import type { SinPlaceContext } from "@/lib/mortal-odds/openrouter";
import { periodOf, withPeriod } from "@/lib/mortal-odds/sin-variants";
import type { SinVariant } from "@/lib/mortal-odds/sin-variants";

/**
 * Regenerates the sin catalog seed file with the place, its period and the era check applied,
 * writing `sin-catalog/sin-catalog.next.json` for review before it replaces `sin-catalog.json`.
 * A polity that outlasts one variant window (an empire) gets one variant per fixed window (see
 * `periodOf`) its span touches, each written for that period and the territory it held then. Resumable: re-running only
 * generates the variants still missing from the output file. Pass `--dry` to just count the work.
 */

const OUT_FILE = path.join(process.cwd(), "sin-catalog", "sin-catalog.next.json");
// Each request takes seconds to answer, so throughput comes from running many at once.
const CONCURRENCY = 30;
const SAVE_EVERY = 25;

type Job = { name: string; year: number; place: SinPlaceContext };
type Catalog = Record<string, { variants: SinVariant[]; useCount: number }>;

/** One year per fixed window the polity's span touches: the middle of the part of the window the polity actually covers. */
function yearsFor(fromYear: number, toYear: number): number[] {
  const years: number[] = [];
  for (let year = fromYear; year <= toYear; year = periodOf(year).toYear + 1) {
    const window = periodOf(year);
    years.push(Math.round((Math.max(fromYear, window.fromYear) + Math.min(toYear, window.toYear)) / 2));
  }
  return years;
}

/** The slice of a polity holding territory in `year`, else the one whose range is nearest to it. */
function sliceAt(slices: CliopatriaFeature[], year: number): CliopatriaFeature {
  const distance = ({ properties: p }: CliopatriaFeature) => (year < p.FromYear ? p.FromYear - year : year > p.ToYear ? year - p.ToYear : 0);
  return slices.reduce((best, slice) => (distance(slice) < distance(best) ? slice : best));
}

async function buildJobs(): Promise<Job[]> {
  const byName = new Map<string, CliopatriaFeature[]>();
  for (const feature of await loadCliopatria()) {
    byName.set(feature.properties.Name, [...(byName.get(feature.properties.Name) ?? []), feature]);
  }

  return Array.from(byName, ([name, slices]) => {
    const fromYear = Math.min(...slices.map((slice) => slice.properties.FromYear));
    const toYear = Math.max(...slices.map((slice) => slice.properties.ToYear));
    return yearsFor(fromYear, toYear).map((year) => ({ name, year, place: { ...centroidOf(sliceAt(slices, year)), fromYear, toYear } }));
  }).flat();
}


async function main() {
  const jobs = await buildJobs();
  const catalog: Catalog = fs.existsSync(OUT_FILE) ? (JSON.parse(fs.readFileSync(OUT_FILE, "utf8")) as Catalog) : {};
  const remaining = jobs.filter((job) => !catalog[job.name]?.variants.some((variant) => variant.fromYear === periodOf(job.year).fromYear));

  console.log(`${jobs.length} variants across ${new Set(jobs.map((job) => job.name)).size} places, ${jobs.length - remaining.length} already done, ${remaining.length} to generate.`);
  if (process.argv.includes("--dry")) return;

  let completed = 0;
  let failed = 0;
  const save = () => fs.writeFileSync(OUT_FILE, JSON.stringify(catalog));

  const queue = [...remaining];
  const worker = async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      try {
        const narratives = await generateSinNarratives({ year: job.year, location: job.name, place: job.place });
        const entry = (catalog[job.name] ??= { variants: [], useCount: 0 });
        entry.variants.push(withPeriod(narratives, job.year));
      } catch (error) {
        failed += 1;
        console.error(`failed for "${job.name}" (${job.year}):`, error instanceof Error ? error.message : error);
      }
      completed += 1;
      if (completed % SAVE_EVERY === 0) {
        save();
        console.log(`${completed}/${remaining.length} done (${failed} failed so far)`);
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  save();
  console.log(`Done. ${remaining.length - failed} variants generated, ${failed} failed. Wrote ${OUT_FILE}`);
}

main().then(() => process.exit(0));
