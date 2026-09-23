import * as z from "zod";
import timeStoriesJson from "@/config/mortal-odds/time-stories.json";
import { worldPopCurve } from "@/lib/mortal-odds/config";
import { interpolate } from "@/lib/mortal-odds/curves";
import { fmtPeople } from "@/lib/mortal-odds/format";
import { pickWeighted } from "@/lib/mortal-odds/rng";
import type { Rng } from "@/lib/mortal-odds/rng";

export const FIRST_YEAR = -6000;
export const LAST_YEAR = 2100;

const timeStorySchema = z.strictObject({
  id: z.string().min(1),
  from: z.number().int(),
  to: z.number().int(),
  text: z.string().min(1),
});

export type TimeStory = z.infer<typeof timeStorySchema>;

export const timeStories: TimeStory[] = z.array(timeStorySchema).parse(timeStoriesJson);

/** Fills `{people}` with how many humans were alive in `year`. */
export function renderTimeStory(text: string, year: number): string {
  const people = fmtPeople(interpolate({ points: worldPopCurve, x: year }));
  return text.replace(/\{people\}/g, people);
}

/** Narrower ranges say something more specific about their years, so they are shown more often. */
const weightOf = (story: TimeStory) => 1 / Math.sqrt(story.to - story.from + 1);

/**
 * Picks a scene-setting line true of `year`: only stories whose range contains it are eligible,
 * ids in `recent` are skipped while alternatives remain, and narrower ranges are likelier.
 */
export function pickTimeStory(options: {
  year: number;
  rng: Rng;
  recent?: readonly string[];
  pool?: TimeStory[];
}): { id: string; text: string } {
  const { year, rng, recent = [], pool = timeStories } = options;
  const covering = pool.filter((story) => story.from <= year && year <= story.to);
  const fresh = covering.filter((story) => !recent.includes(story.id));
  const candidates = fresh.length > 0 ? fresh : covering;

  if (candidates.length === 0) return { id: "fallback", text: "" };

  const chosen = pickWeighted({ items: candidates, weight: weightOf, rng });
  return { id: chosen.id, text: renderTimeStory(chosen.text, year) };
}

type Anachronism = { pattern: RegExp; earliest: number };

/**
 * Words that cannot appear in a story whose range starts before the thing existed. Years are the
 * earliest plausible date, rounded; a story's `from` must be at or after it. Keep the model prompt in sync.
 */
export const ANACHRONISMS: Anachronism[] = [
  { pattern: /\b(villages?|farm|farms|farmer|farmers|farming|farmed|crops?|plough|plow)\b/i, earliest: -10000 },
  { pattern: /\b(temples?)\b/i, earliest: -9500 },
  { pattern: /\b(bronze)\b/i, earliest: -3300 },
  { pattern: /\b(cit(y|ies))\b/i, earliest: -3700 },
  { pattern: /\b(writing|written|scribes?)\b/i, earliest: -3200 },
  { pattern: /\b(kings?|kingdoms?|pharaohs?|egypt|egyptian)\b/i, earliest: -3100 },
  { pattern: /\b(pyramids?)\b/i, earliest: -2600 },
  { pattern: /\b(empires?)\b/i, earliest: -2300 },
  { pattern: /\b(alphabets?)\b/i, earliest: -1800 },
  { pattern: /\b(iron)\b/i, earliest: -1200 },
  { pattern: /\b(greek|greeks|greece|athens)\b/i, earliest: -800 },
  { pattern: /\b(rome|roman|romans)\b/i, earliest: -750 },
  { pattern: /\b(coins?|philosophers?|democracy)\b/i, earliest: -600 },
  { pattern: /\b(buddhis[mt]s?)\b/i, earliest: -500 },
  { pattern: /\b(christian|christians|christianity)\b/i, earliest: 30 },
  { pattern: /\b(medieval)\b/i, earliest: 500 },
  { pattern: /\b(muslims?|islam|islamic|mosques?)\b/i, earliest: 610 },
  { pattern: /\b(vikings?)\b/i, earliest: 790 },
  { pattern: /\b(feudal|knights?)\b/i, earliest: 800 },
  { pattern: /\b(gunpowder)\b/i, earliest: 850 },
  { pattern: /\b(crusades?|crusaders?)\b/i, earliest: 1095 },
  { pattern: /\b(mongols?)\b/i, earliest: 1200 },
  { pattern: /\b(cannons?)\b/i, earliest: 1250 },
  { pattern: /\b(renaissance)\b/i, earliest: 1300 },
  { pattern: /\b(black death)\b/i, earliest: 1346 },
  { pattern: /\b(printing presses?)\b/i, earliest: 1440 },
  { pattern: /\b(america|americas|american|americans)\b/i, earliest: 1492 },
  { pattern: /\b(muskets?)\b/i, earliest: 1500 },
  { pattern: /\b(reformation)\b/i, earliest: 1517 },
  { pattern: /\b(newspapers?)\b/i, earliest: 1605 },
  { pattern: /\b(telescopes?)\b/i, earliest: 1608 },
  { pattern: /\b(steam)\b/i, earliest: 1712 },
  { pattern: /\b(factory|factories)\b/i, earliest: 1750 },
  { pattern: /\b(napoleon|napoleonic)\b/i, earliest: 1799 },
  { pattern: /\b(railways?|railroads?|locomotives?)\b/i, earliest: 1825 },
  { pattern: /\b(telegraphs?)\b/i, earliest: 1837 },
  { pattern: /\b(photographs?|photography)\b/i, earliest: 1839 },
  { pattern: /\b(telephones?)\b/i, earliest: 1876 },
  { pattern: /\b(electric|electricity|electrified)\b/i, earliest: 1880 },
  { pattern: /\b(automobiles?|motorcars?)\b/i, earliest: 1885 },
  { pattern: /\b(cinemas?|movies?)\b/i, earliest: 1895 },
  { pattern: /\b(radios?)\b/i, earliest: 1900 },
  { pattern: /\b(airplanes?|aeroplanes?|aircraft)\b/i, earliest: 1903 },
  { pattern: /\b(world war|great war)\b/i, earliest: 1914 },
  { pattern: /\b(jazz)\b/i, earliest: 1917 },
  { pattern: /\b(television|televisions)\b/i, earliest: 1927 },
  { pattern: /\b(antibiotics?|penicillin)\b/i, earliest: 1928 },
  { pattern: /\b(great depression)\b/i, earliest: 1929 },
  { pattern: /\b(jets?)\b/i, earliest: 1944 },
  { pattern: /\b(atomic|nuclear|computers?)\b/i, earliest: 1945 },
  { pattern: /\b(cold war)\b/i, earliest: 1947 },
  { pattern: /\b(satellites?)\b/i, earliest: 1957 },
  { pattern: /\b(moon landing|walked on the moon)\b/i, earliest: 1969 },
  { pattern: /\b(internet|online|email|websites?)\b/i, earliest: 1990 },
  { pattern: /\b(social media)\b/i, earliest: 2004 },
  { pattern: /\b(smartphones?)\b/i, earliest: 2007 },
];

const MIN_LENGTH = 30;
export const MAX_LENGTH = 220;

/** Everything wrong with one story, as readable sentences; empty when it is safe to ship. */
export function lintTimeStory(story: TimeStory): string[] {
  const problems: string[] = [];
  const label = `[${story.id}]`;

  if (story.from > story.to) problems.push(`${label} from (${story.from}) is after to (${story.to})`);
  if (story.from < FIRST_YEAR) problems.push(`${label} from (${story.from}) is before ${FIRST_YEAR}`);
  if (story.to > LAST_YEAR) problems.push(`${label} to (${story.to}) is after ${LAST_YEAR}`);

  if (story.text.length < MIN_LENGTH || story.text.length > MAX_LENGTH) {
    problems.push(`${label} text must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${story.text.length}`);
  }
  if (/\d/.test(story.text)) problems.push(`${label} text contains a digit; spell numbers out or use {people}`);

  const withoutToken = story.text.replace(/\{people\}/g, " ");
  if (/[{}]/.test(withoutToken)) problems.push(`${label} text has an unknown placeholder; only {people} is allowed`);

  for (const { pattern, earliest } of ANACHRONISMS) {
    const hit = withoutToken.match(pattern)?.[0];
    if (hit && story.from < earliest) {
      problems.push(`${label} says "${hit}", which only fits from year ${earliest}, but the range starts at ${story.from}`);
    }
  }

  return problems;
}

/** Minimum stories that must cover every year, so the slide never runs dry and always has a line to vary. */
export const MIN_COVERAGE = 2;

/** Lint for the whole file: per-story problems, duplicate ids/texts, and year ranges with too few stories. */
export function lintTimeStories(list: TimeStory[], lastYear = LAST_YEAR): string[] {
  const problems = list.flatMap(lintTimeStory);
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  for (const story of list) {
    if (seenIds.has(story.id)) problems.push(`[${story.id}] id is used more than once`);
    seenIds.add(story.id);
    const key = story.text.trim().toLowerCase();
    if (seenTexts.has(key)) problems.push(`[${story.id}] text duplicates another story`);
    seenTexts.add(key);
  }

  const gaps: string[] = [];
  let gapStart: number | null = null;
  const flush = (end: number) => {
    if (gapStart !== null) gaps.push(gapStart === end ? `${gapStart}` : `${gapStart}..${end}`);
    gapStart = null;
  };

  for (let year = FIRST_YEAR; year <= lastYear; year++) {
    const count = list.filter((story) => story.from <= year && year <= story.to).length;
    if (count < MIN_COVERAGE) gapStart ??= year;
    else flush(year - 1);
  }
  flush(lastYear);

  if (gaps.length > 0) problems.push(`coverage: fewer than ${MIN_COVERAGE} stories for years ${gaps.join(", ")}`);
  return problems;
}
