import fs from "node:fs";
import path from "node:path";
import { worldPopCurve } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { checkPopulation } from "@/lib/mortal-odds/population-lint";
import { estimatePopulation, estimatesAt } from "@/lib/mortal-odds/population-estimate";

/**
 * Audits the population the game serves. Population in the past can't be known exactly, so this
 * measures what can be: (1) the hard rules that must always hold - no polity above what the world
 * or its own area allows, no year's polities adding up to far more than everyone alive - which fail
 * the run, and (2) how close the estimates sit to the researched (Seshat) figures kept in
 * cliopatria-population.researched.json, reported as an error distribution to track as the model changes.
 */

const RESEARCHED_FILE = path.join(process.cwd(), "cliopatria.geojson", "cliopatria-population.researched.json");
const YEARS = [-3000, -1000, -500, 1, 200, 500, 1000, 1300, 1500, 1700, 1800, 1900, 1950, 2000];
/** Overlapping and nested polities legitimately double count some people; more than this share over the world is a bug. */
const MAX_OVER_WORLD = 1.5;
const WORST_SHOWN = 10;

type Reference = { name: string; year: number; population: number; areaKm2: number };

function readReferences(): Reference[] {
  const { rows } = JSON.parse(fs.readFileSync(RESEARCHED_FILE, "utf8")) as { rows: (string | number)[][] };
  return rows
    .filter((row) => String(row[9]).startsWith("seshat"))
    .map((row) => ({ name: String(row[0]), year: (Number(row[1]) + Number(row[2])) / 2, population: Number(row[6]), areaKm2: Number(row[5]) }));
}

const world = (year: number) => interpolate({ points: worldPopCurve, x: year });
const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)] ?? NaN;

function checkRules(): string[] {
  const failures: string[] = [];
  for (const year of YEARS) {
    const estimates = estimatesAt(year);
    for (const e of estimates) {
      const problem = checkPopulation({ estimate: { low: e.low, mid: e.population, high: e.high }, areaKm2: e.areaKm2, world: world(year), year });
      if (problem) failures.push(`${e.empire} in ${year}: ${problem}`);
    }
    const total = estimates.reduce((sum, e) => sum + e.population, 0);
    if (total > world(year) * MAX_OVER_WORLD) failures.push(`${year}: polities add up to ${(total / 1e6).toFixed(0)}M, over ${MAX_OVER_WORLD}x the ${(world(year) / 1e6).toFixed(0)}M alive`);
  }
  return failures;
}

function compareToResearched() {
  const rows = readReferences().flatMap((ref) => {
    const estimate = estimatePopulation({ empire: ref.name, year: ref.year });
    // A reference that itself breaks the rules (Seshat scaled onto a tiny or huge territory) can't judge anything.
    const usable = ref.population > 0 && checkPopulation({ estimate: { low: ref.population, mid: ref.population, high: ref.population }, areaKm2: ref.areaKm2, world: world(ref.year), year: ref.year }) === null;
    return estimate && usable ? [{ ...ref, estimate: estimate.population, ratio: estimate.population / ref.population }] : [];
  });
  const within = (factor: number) => rows.filter((row) => row.ratio >= 1 / factor && row.ratio <= factor).length / rows.length;
  console.log(`\nAgainst ${rows.length} usable researched (Seshat) figures: estimate / researched`);
  console.log(`  median ${median(rows.map((row) => row.ratio)).toFixed(2)}x   within 1.5x: ${(within(1.5) * 100).toFixed(0)}%   within 2x: ${(within(2) * 100).toFixed(0)}%   within 5x: ${(within(5) * 100).toFixed(0)}%`);
  const byError = [...rows].sort((a, b) => Math.abs(Math.log(b.ratio)) - Math.abs(Math.log(a.ratio)));
  console.log(`  ${WORST_SHOWN} furthest off:`);
  for (const row of byError.slice(0, WORST_SHOWN)) {
    console.log(`    ${row.name} (${Math.round(row.year)}): ${(row.estimate / 1e6).toFixed(2)}M vs researched ${(row.population / 1e6).toFixed(2)}M  (${row.ratio.toFixed(2)}x)`);
  }
}

const failures = checkRules();
console.log(failures.length === 0 ? "Rules: all hold." : `Rules: ${failures.length} broken.\n${failures.slice(0, 25).map((f) => `  ${f}`).join("\n")}`);
compareToResearched();
process.exit(failures.length === 0 ? 0 : 1);
