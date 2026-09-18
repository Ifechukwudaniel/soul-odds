// fetchworldpopulation.ts
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const CURVES_PATH =
  execSync("find . -name curves.json -path '*/mortal-odds/*' -not -path '*/node_modules/*'")
    .toString()
    .trim()
    .split("\n")[0] ?? "";

if (!CURVES_PATH) {
  throw new Error("Could not locate config/mortal-odds/curves.json — check the path manually.");
}

const HISTORICAL_URL =
  "https://ourworldindata.org/grapher/population.csv?v=1&csvType=full&useColumnShortNames=true";
const PROJECTED_URL =
  "https://ourworldindata.org/grapher/population-with-un-projections.csv?v=1&csvType=full&useColumnShortNames=true";

type Row = readonly [number, number];

/** Some OWID CSVs split one indicator across multiple columns (e.g. historical vs. projected),
 * where each row only has a value in ONE of them and the other is blank. This picks the first
 * non-empty value per row across all columns whose name contains "population". */
function parseWorldRows(csv: string, label: string): Row[] {
  const [header, ...body] = csv.trim().split("\n");
  if (!header) throw new Error(`${label}: empty response`);

  const cols = header.split(",");
  const entityIdx = cols.indexOf("entity");
  const yearIdx = cols.indexOf("year");
  const popColIndices = cols
    .map((c, i) => ({ name: c.toLowerCase(), i }))
    .filter(({ name }) => name.includes("population"))
    .map(({ i }) => i);

  if (entityIdx === -1 || yearIdx === -1 || popColIndices.length === 0) {
    console.log(`${label}: header was`, cols);
    throw new Error(`${label}: could not find entity/year/population columns`);
  }
  console.log(`${label}: population-like columns at indices`, popColIndices, "->", popColIndices.map((i) => cols[i]));

  const rows: Row[] = [];
  for (const line of body) {
    const c = line.split(",");
    if (c[entityIdx] !== "World") continue;

    const year = Number(c[yearIdx]);
    if (!Number.isFinite(year)) continue;

    let pop: number | null = null;
    for (const idx of popColIndices) {
      const raw = c[idx];
      if (raw !== undefined && raw !== "") {
        const n = Number(raw);
        if (Number.isFinite(n)) {
          pop = n;
          break;
        }
      }
    }
    if (pop !== null) rows.push([year, pop]);
  }

  if (rows.length === 0) {
    const entities = [...new Set(body.map((l) => l.split(",")[entityIdx]))].slice(0, 15);
    console.log(`${label}: no usable 'World' rows found. Sample entities:`, entities);
    throw new Error(`${label}: 0 usable rows for entity 'World'`);
  }

  console.log(`${label}: ${rows.length} rows, ${rows[0]![0]} -> ${rows[rows.length - 1]![0]}`);
  return rows;
}

async function fetchCsv(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "mortal-odds data fetch/1.0" } });
  if (!res.ok) throw new Error(`Fetch failed (${res.status} ${res.statusText}) for ${url}`);
  return res.text();
}

async function main() {
  const [historicalCsv, projectedCsv] = await Promise.all([
    fetchCsv(HISTORICAL_URL),
    fetchCsv(PROJECTED_URL),
  ]);

  const historical = parseWorldRows(historicalCsv, "historical");
  const projected = parseWorldRows(projectedCsv, "projected");

  const lastHistoricalYear = historical[historical.length - 1]![0];
  const futureOnly = projected.filter(([year]) => year > lastHistoricalYear);

  console.log(`future-only rows kept: ${futureOnly.length}`);
  if (futureOnly.length > 0) {
    console.log(`  sample: ${futureOnly[0]} ... ${futureOnly[futureOnly.length - 1]}`);
  }

  const merged = [...historical, ...futureOnly].sort((a, b) => a[0] - b[0]);
  if (merged.length < 2) throw new Error(`Merged result too small: ${merged.length} rows`);

  const curves = JSON.parse(readFileSync(CURVES_PATH, "utf8"));
  curves.worldPop = merged;
  writeFileSync(CURVES_PATH, `${JSON.stringify(curves, null, 2)}\n`);

  console.log(`\nWrote ${merged.length} points to ${CURVES_PATH}`);
  console.log(`Range: ${merged[0]![0]} -> ${merged[merged.length - 1]![0]}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});