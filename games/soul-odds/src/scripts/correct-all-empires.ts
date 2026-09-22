import { correctedBoundaryYears } from "@/lib/mortal-odds/cliopatria-correction";
import { fetchWikidataDates } from "@/lib/mortal-odds/wikidata";
import {
  type CliopatriaPlaceRow,
  findAllCliopatriaPlacesWithWikidata,
  updateCliopatriaPlaceYears,
} from "@/services/db/cliopatria";

// A gap between requests so this stays a well-behaved anonymous Wikidata client instead of
// tripping its rate limiter (see fetchWikidataDates's retry/backoff for when it still does).
const REQUEST_GAP_MS = 200;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Corrects every cliopatria_place row's polity-boundary years against Wikidata. Groups rows by
 * Wikidata id first - a polity has one row per date slice but shares a single Wikidata id across
 * all of them, so this makes one Wikidata call per polity (~1.4k) instead of per row (~13.7k).
 */
async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const rows = await findAllCliopatriaPlacesWithWikidata();
  const byWikidata = new Map<string, CliopatriaPlaceRow[]>();
  for (const row of rows) {
    if (!row.wikidata) continue;
    const group = byWikidata.get(row.wikidata) ?? [];
    group.push(row);
    byWikidata.set(row.wikidata, group);
  }

  console.log(`Checking ${byWikidata.size} distinct polities across ${rows.length} rows...`);

  let checked = 0;
  let corrected = 0;

  for (const [wikidata, group] of byWikidata) {
    checked += 1;

    let dates: Awaited<ReturnType<typeof fetchWikidataDates>>;
    try {
      dates = await fetchWikidataDates(wikidata);
    } catch (error) {
      console.log(`[${checked}/${byWikidata.size}] ${wikidata}: Wikidata request failed, skipping - ${error}`);
      continue;
    }

    const corrections = correctedBoundaryYears(group, dates);

    for (const row of group) {
      const correction = corrections.get(row.id);
      if (!correction) continue;

      console.log(
        `[${checked}/${byWikidata.size}] #${row.id} ${row.name}: ` +
          `(${row.fromYear}..${row.toYear}) -> (${correction.fromYear}..${correction.toYear})`,
      );

      if (!dryRun) await updateCliopatriaPlaceYears(row.id, correction.fromYear, correction.toYear);
      corrected += 1;
    }

    await sleep(REQUEST_GAP_MS);
  }

  console.log(`Done. ${corrected} row(s) ${dryRun ? "would be corrected" : "corrected"}.`);
}

main().then(() => process.exit(0));
