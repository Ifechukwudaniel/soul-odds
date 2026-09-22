import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CliopatriaFeature } from "@/lib/mortal-odds/cliopatria";
import { correctedFeatureBoundaries } from "@/lib/mortal-odds/cliopatria-geojson-correction";
import { fetchWikidataDates } from "@/lib/mortal-odds/wikidata";

const CLIOPATRIA_PATH = path.join(process.cwd(), "cliopatria.geojson", "cliopatria_polities_only.geojson");
const ENV_PATH = path.join(process.cwd(), ".env");
const REQUEST_GAP_MS = 200;
const CORRECTED_FLAG = "CLIOPATRIA_CORRECTED";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sets CLIOPATRIA_CORRECTED=true in .env so future runs skip this - it only needs to happen once, not on every `pnpm start`. */
async function markCorrected(): Promise<void> {
  let env = "";
  try {
    env = await readFile(ENV_PATH, "utf8");
  } catch {
    // No .env yet - write a fresh one with just this flag.
  }

  const line = `${CORRECTED_FLAG}=true`;
  const flagPattern = new RegExp(`^${CORRECTED_FLAG}=.*$`, "m");

  env = flagPattern.test(env) ? env.replace(flagPattern, line) : `${env}${env.endsWith("\n") || env === "" ? "" : "\n"}${line}\n`;

  await writeFile(ENV_PATH, env);
}

async function main() {
  if (process.env[CORRECTED_FLAG] === "true") {
    console.log(`*** ${CORRECTED_FLAG}=true - cliopatria.geojson already corrected. Skipping.`);
    return;
  }

  let raw: string;
  try {
    raw = await readFile(CLIOPATRIA_PATH, "utf8");
  } catch {
    console.log("*** cliopatria.geojson not found locally. Skipping.");
    return;
  }

  const geojson = JSON.parse(raw) as { features: CliopatriaFeature[] } & Record<string, unknown>;
  const features = geojson.features;

  const byWikidata = new Map<string, number[]>();
  features.forEach((feature, index) => {
    const qid = feature.properties.Wikidata;
    if (!qid) return;
    const group = byWikidata.get(qid) ?? [];
    group.push(index);
    byWikidata.set(qid, group);
  });

  console.log(`Correcting ${byWikidata.size} distinct polities across ${features.length} features...`);

  let checked = 0;
  let corrected = 0;

  for (const [qid, featureIndices] of byWikidata) {
    checked += 1;

    let dates: Awaited<ReturnType<typeof fetchWikidataDates>>;
    try {
      dates = await fetchWikidataDates(qid);
    } catch (error) {
      console.log(`[${checked}/${byWikidata.size}] ${qid}: Wikidata request failed, skipping - ${error}`);
      continue;
    }

    const group = featureIndices.map((index) => features[index]!);
    const corrections = correctedFeatureBoundaries(group, dates);

    for (const [groupIndex, correction] of corrections) {
      const feature = group[groupIndex]!;
      console.log(
        `[${checked}/${byWikidata.size}] ${feature.properties.Name}: ` +
          `(${feature.properties.FromYear}..${feature.properties.ToYear}) -> (${correction.fromYear}..${correction.toYear})`,
      );
      feature.properties.FromYear = correction.fromYear;
      feature.properties.ToYear = correction.toYear;
      corrected += 1;
    }

    await sleep(REQUEST_GAP_MS);
  }

  await writeFile(CLIOPATRIA_PATH, JSON.stringify(geojson));
  await markCorrected();

  console.log(`Done. ${corrected} feature(s) corrected and written back to cliopatria.geojson. Set ${CORRECTED_FLAG}=true in .env.`);
}

main().then(() => process.exit(0));
