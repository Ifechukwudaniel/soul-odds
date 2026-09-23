import fs from "node:fs";
import path from "node:path";
import { buildWindowJobs } from "@/lib/mortal-odds/cliopatria-windows";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
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

type Catalog = Record<string, { variants: SinVariant[]; useCount: number }>;

async function main() {
  const jobs = await buildWindowJobs();
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
