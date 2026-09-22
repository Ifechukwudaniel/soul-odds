import { correctedBoundaryYears } from "@/lib/mortal-odds/cliopatria-correction";
import { fetchWikidataDates } from "@/lib/mortal-odds/wikidata";
import {
  type CliopatriaPlaceRow,
  findCliopatriaPlacesByName,
  updateCliopatriaPlaceYears,
} from "@/services/db/cliopatria";

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const apply = args.includes("--apply");
  const name = args.find((arg) => arg !== "--apply");

  if (!name) {
    console.error('Usage: pnpm run correct:empire -- "<empire name>" [--apply]');
    console.error("Without --apply this only reports mismatches; pass --apply to write the fixes to the DB.");
    process.exit(1);
  }

  const rows = await findCliopatriaPlacesByName(name);
  if (rows.length === 0) {
    console.log(`No cliopatria_place row named "${name}".`);
    return;
  }

  const byWikidata = new Map<string, CliopatriaPlaceRow[]>();
  for (const row of rows) {
    if (!row.wikidata) {
      console.log(`#${row.id} ${row.name} (${row.fromYear}..${row.toYear}): no Wikidata id on file, can't verify`);
      continue;
    }
    const group = byWikidata.get(row.wikidata) ?? [];
    group.push(row);
    byWikidata.set(row.wikidata, group);
  }

  for (const [wikidata, group] of byWikidata) {
    const dates = await fetchWikidataDates(wikidata);
    console.log(
      `${group[0]!.name} [${wikidata}]: Wikidata inception ${dates.inception ?? "unknown"}, ` +
        `dissolved ${dates.dissolved ?? "unknown"}`,
    );

    const corrections = correctedBoundaryYears(group, dates);
    if (corrections.size === 0) {
      console.log("  boundaries already consistent");
      continue;
    }

    for (const row of group) {
      const correction = corrections.get(row.id);
      if (!correction) continue;

      const suffix = apply ? "" : " [dry run - pass --apply to write]";
      console.log(`  #${row.id} (${row.fromYear}..${row.toYear}) -> (${correction.fromYear}..${correction.toYear})${suffix}`);

      if (apply) await updateCliopatriaPlaceYears(row.id, correction.fromYear, correction.toYear);
    }
  }
}

main().then(() => process.exit(0));
