import { db } from "@/services/db";
import { generateSinNarratives } from "@/lib/mortal-odds/openrouter";
import { readSinCatalog, writeSinCatalog } from "@/lib/mortal-odds/sin-catalog";
import { cliopatriaPlaceSchema } from "@/services/db/Schema";
import type { SinCatalog } from "@/lib/mortal-odds/sin-catalog";

/**
 * Pre-generates one OpenRouter sin-narrative variant per distinct real Cliopatria place, so the
 * live `/api/mortal-odds/sins` route can serve most rounds from this static catalog instead of
 * calling OpenRouter on every draw (the route grows each place's variant pool further over time
 * as it gets reused — see `GROWTH_INTERVAL` there). Resumable: re-running only fills in places
 * missing from the existing output file, and progress is flushed to disk periodically so an
 * interruption doesn't lose completed work.
 */

const CONCURRENCY = 10;
const FLUSH_EVERY = 25;

type Target = { name: string; year: number };

/** One representative year per distinct place name: the midpoint of its widest attested span. */
async function buildTargets(): Promise<Target[]> {
  const rows = await db
    .select({ name: cliopatriaPlaceSchema.name, fromYear: cliopatriaPlaceSchema.fromYear, toYear: cliopatriaPlaceSchema.toYear })
    .from(cliopatriaPlaceSchema);

  const widestSpanByName = new Map<string, { fromYear: number; toYear: number }>();
  for (const row of rows) {
    const span = row.toYear - row.fromYear;
    const existing = widestSpanByName.get(row.name);
    if (!existing || span > existing.toYear - existing.fromYear) {
      widestSpanByName.set(row.name, { fromYear: row.fromYear, toYear: row.toYear });
    }
  }

  return Array.from(widestSpanByName.entries()).map(([name, { fromYear, toYear }]) => ({
    name,
    year: Math.round((fromYear + toYear) / 2),
  }));
}

async function main() {
  const targets = await buildTargets();
  const catalog: SinCatalog = await readSinCatalog();
  const remaining = targets.filter((target) => !(target.name in catalog));

  console.log(`${targets.length} distinct places, ${targets.length - remaining.length} already cataloged, ${remaining.length} to generate.`);

  let completed = 0;
  let failed = 0;

  async function worker(queue: Target[]) {
    for (const target of queue) {
      try {
        const narratives = await generateSinNarratives({ year: target.year, location: target.name });
        catalog[target.name] = { variants: [narratives], useCount: 0 };
      } catch (error) {
        failed += 1;
        console.error(`[${completed + 1}/${remaining.length}] failed for "${target.name}" (${target.year}):`, error instanceof Error ? error.message : error);
      }
      completed += 1;
      if (completed % FLUSH_EVERY === 0) {
        await writeSinCatalog(catalog);
        console.log(`${completed}/${remaining.length} done (${failed} failed so far)`);
      }
    }
  }

  const chunks: Target[][] = Array.from({ length: CONCURRENCY }, () => []);
  remaining.forEach((target, index) => chunks[index % CONCURRENCY]!.push(target));

  await Promise.all(chunks.map(worker));
  await writeSinCatalog(catalog);
  console.log(`Done. ${Object.keys(catalog).length} places cataloged (${failed} failures this run).`);
  process.exit(0);
}

main();
