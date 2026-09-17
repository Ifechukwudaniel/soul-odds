import type { JobsConfig } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { Rng } from "@/lib/mortal-odds/rng";
import type { Life, Place } from "@/types";

function jobTier(year: number): keyof JobsConfig {
  if (year < -8000) return "forager";
  if (year < 1800) return "premodern";
  if (year < 1950) return "industrial";
  return "modern";
}

function pickRandom<T>(items: readonly T[], rng: Rng): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("pickRandom: items must not be empty");
  return item;
}

/** A short narrative for the reveal's life page, matching the MVP's exact sentence templates. */
export function tellStory(options: {
  life: Life;
  place: Place;
  currentYear: number;
  childDeathShare: number;
  jobs: JobsConfig;
  rng: Rng;
}): string {
  const { life, place, currentYear, childDeathShare, jobs, rng } = options;
  const she = life.sex === "girl" ? "She" : "He";
  const alive = life.deathYear >= currentYear;
  const placePhrase = life.year < -8000 ? `a foraging band in ${place.name}` : place.name;
  const parts = [`${life.sex === "girl" ? "A girl" : "A boy"} is born in ${placePhrase}, ${fmtYear(life.year)}.`];
  const grownUp = alive ? currentYear - life.year >= 16 : life.age >= 16;

  if (grownUp) {
    const tierJobs = jobs[jobTier(life.year)];
    const pool = life.literate && tierJobs.lit.length > 0 && rng() < 0.6 ? tierJobs.lit : tierJobs[life.city ? "city" : "land"];
    parts.push(
      `${she} works as ${pickRandom(pool, rng)}, ${life.literate ? "can read" : "never learns to read"}, and ${life.city ? "spends years in a city" : "lives on the land"}.`,
    );
  }

  if (alive) {
    parts.push(`${she} is alive today, with a projected lifespan of ${life.age} years.`);
  } else if (life.shock) {
    parts.push(`${she} dies at ${life.age} in ${fmtYear(life.deathYear)}, a victim of ${life.shock.phrase}.`);
  } else if (life.age === 0) {
    parts.push(`${she} dies before turning one.`);
  } else {
    parts.push(`${she} dies at ${life.age} in ${fmtYear(life.deathYear)}.`);
  }

  if (life.age < 5 && !alive) {
    parts.push(`About ${Math.round(childDeathShare * 10)} in 10 children born there and then never reached five.`);
  }

  return parts.join(" ");
}
