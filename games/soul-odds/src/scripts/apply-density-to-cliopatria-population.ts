import fs from "node:fs";
import path from "node:path";
import { placesConfig, erasConfig, worldPopCurve } from "@/lib/mortal-odds/config";
import { centroidOf, loadCliopatria } from "@/lib/mortal-odds/cliopatria";
import { interpolate } from "@/lib/mortal-odds/curves";
import { populationFromDensity } from "@/lib/mortal-odds/density";
import { regionNear } from "@/lib/mortal-odds/draw";
import { calibrateToWorld } from "@/lib/mortal-odds/population-lint";

/**
 * Rewrites every row of cliopatria.geojson/cliopatria-population.json so its population is what the
 * density model gives: the density of the polity's region in the row's middle year times the row's
 * area (see `lib/mortal-odds/density.ts`), instead of a researched or model-guessed headcount. The
 * low and high figures keep the same spread around the new number that the row had before. Each row
 * also records its region, so `population-estimate.ts` can redo the sum for the exact year asked
 * about rather than scaling the stored figure.
 *
 * The first run keeps the file it replaces as cliopatria-population.researched.json and every run
 * reads from that copy, so running this again (after tuning the density model) never compounds.
 */

const DATA_DIR = path.join(process.cwd(), "cliopatria.geojson");
const FILE = path.join(DATA_DIR, "cliopatria-population.json");
const RESEARCHED_FILE = path.join(DATA_DIR, "cliopatria-population.researched.json");

const COLUMNS = ["name", "fromYear", "toYear", "wikidata", "seshatId", "areaKm2", "population", "low", "high", "method", "region"] as const;
/** The spread used for a row whose old figure was zero, so it has no ratio to keep. */
const DEFAULT_LOW = 0.7;
const DEFAULT_HIGH = 1.4;

type Row = { name: string; fromYear: number; toYear: number; wikidata: string; seshatId: string; areaKm2: number; population: number; low: number; high: number; method: string; region?: string };

function readRows(file: string): Row[] {
  const { rows } = JSON.parse(fs.readFileSync(file, "utf8")) as { rows: (string | number)[][] };
  return rows.map(([name, fromYear, toYear, wikidata, seshatId, areaKm2, population, low, high, method]) => ({
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
  }));
}

async function main() {
  if (!fs.existsSync(RESEARCHED_FILE)) fs.copyFileSync(FILE, RESEARCHED_FILE);
  const source = readRows(RESEARCHED_FILE);

  const centroids = new Map<string, { fromYear: number; toYear: number; lat: number; lon: number }[]>();
  for (const feature of await loadCliopatria()) {
    const { Name, FromYear, ToYear } = feature.properties;
    centroids.set(Name, [...(centroids.get(Name) ?? []), { fromYear: FromYear, toYear: ToYear, ...centroidOf(feature) }]);
  }

  const missing: string[] = [];
  const rows = source.map((row): Row => {
    const candidates = centroids.get(row.name) ?? [];
    const at = candidates.find((c) => c.fromYear <= row.toYear && c.toYear >= row.fromYear) ?? candidates[0];
    if (!at) {
      missing.push(row.name);
      return row;
    }

    const year = (row.fromYear + row.toYear) / 2;
    const region = regionNear({ lat: at.lat, lon: at.lon, placesConfig });
    const population = Math.round(populationFromDensity({ year, region, areaKm2: row.areaKm2, erasConfig }));
    const lowRatio = row.population > 0 ? row.low / row.population : DEFAULT_LOW;
    const highRatio = row.population > 0 ? row.high / row.population : DEFAULT_HIGH;
    return { ...row, population, low: Math.round(population * lowRatio), high: Math.round(population * highRatio), method: "density", region };
  });

  const calibrated = calibrateToWorld(rows, (year) => interpolate({ points: worldPopCurve, x: year }));
  fs.writeFileSync(FILE, JSON.stringify({ columns: COLUMNS, rows: calibrated.map((row) => COLUMNS.map((column) => row[column] ?? "")) }));

  console.log(`Rewrote ${calibrated.length} rows (${missing.length} kept as they were: no matching Cliopatria polity).`);
  for (const year of [-3000, -1000, 1, 500, 1000, 1500, 1800, 1900, 2000]) {
    const total = calibrated.filter((row) => row.fromYear <= year && year <= row.toYear && !row.name.startsWith("(")).reduce((sum, row) => sum + row.population, 0);
    console.log(`  year ${year}: rows sum to ${(total / 1e6).toFixed(0)}M of ${(interpolate({ points: worldPopCurve, x: year }) / 1e6).toFixed(0)}M alive`);
  }
}

main();
