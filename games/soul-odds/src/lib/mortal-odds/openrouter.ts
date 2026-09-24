import * as z from 'zod';
import { fmtYear, lowercaseFirst } from '@/lib/mortal-odds/format';
import { findAnachronism } from '@/lib/mortal-odds/life-story-lint';
import { checkPopulation } from '@/lib/mortal-odds/population-lint';
import type { PopulationRange } from '@/lib/mortal-odds/population-lint';
import type { SinPlaceContext } from '@/lib/mortal-odds/sin-variants';
import { Env } from '@/libs/Env';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'mistralai/mistral-nemo';

/**
 * Calls the chat completions endpoint and returns the parsed JSON content as-is (could be an
 * object or an array — this model doesn't reliably follow "reply with a JSON object" over "reply
 * with a JSON array", so callers handle whichever shape their prompt actually gets back).
 * Throws on a missing key, request failure, or a response that isn't valid JSON.
 */
async function completeJson(
  systemPrompt: string,
  userPrompt: string,
  model: string = MODEL,
): Promise<unknown> {
  const apiKey = Env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const startedAt = Date.now();
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  console.log(
    `[openrouter] ${model} responded in ${Date.now() - startedAt}ms (status ${response.status})`,
  );

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenRouter response had no content');
  }

  return parseJsonReply(content);
}

/** Parses a reply as JSON, falling back to the outermost object or array in it for models that wrap the JSON in prose or a code fence. */
function parseJsonReply(content: string): unknown {
  try {
    return JSON.parse(content) as unknown;
  } catch (error) {
    const start = content.search(/[{[]/);
    const end = Math.max(content.lastIndexOf('}'), content.lastIndexOf(']'));
    if (start === -1 || end <= start) throw error;
    return JSON.parse(content.slice(start, end + 1)) as unknown;
  }
}

/** "Gutian Dynasty (2150 BCE to 2050 BCE), around latitude 33.1, longitude 44.2" — the place as the population prompt describes it. */
function describePlace(location: string, place: SinPlaceContext | undefined): string {
  if (!place) return location;
  const period =
    place.fromYear !== undefined && place.toYear !== undefined
      ? ` (${fmtYear(place.fromYear)} to ${fmtYear(place.toYear)})`
      : '';
  return `${location}${period}, around latitude ${place.lat.toFixed(1)}, longitude ${place.lon.toFixed(1)}`;
}

const lifeStorySchema = z.object({
  story: z.string().min(1).max(1200),
  name: z.string().min(1).max(60),
});

export type LifeStoryNarrative = z.infer<typeof lifeStorySchema> & { birthYear: number };

const LIFE_STORY_ATTEMPTS = 2;

const LIFE_STORY_SYSTEM_PROMPT =
  'You write short, period-accurate prose life stories for a historical fortune-telling game, expanding a bare list of facts into 3-5 flowing sentences. Reply with strict JSON: {"story": string, "name": string}. `name` is a single given name fitting the era, place and sex; use that same name throughout `story` in place of "the girl"/"the boy". Stay third person, past tense, no dialogue. Match technology, work, weapons and daily life to the exact years given: from 1900 on there are no bows, swords, spears or raiding parties, and years after 2025 are the near future. Do not invent battles, heroics, special skills or events beyond the given facts; describe ordinary daily life instead. Do not contradict or omit any given fact.';

/** Asks OpenRouter for the soul's life story, retrying once when it uses weapons that don't fit the era. */
export async function generateLifeStory(options: {
  sex: 'girl' | 'boy';
  year: number;
  location: string;
  age: number;
  deathYear: number;
  sinPhrase: string | null;
  cause: string | null;
}): Promise<LifeStoryNarrative> {
  const { sex, year, location, age, deathYear, sinPhrase, cause } = options;
  const alive = deathYear >= new Date().getFullYear();

  const facts = [
    `Born ${sex === 'girl' ? 'a girl' : 'a boy'} in ${location}, ${fmtYear(year)}.`,
    sinPhrase ? `Along the way, ${lowercaseFirst(sinPhrase)}.` : null,
    alive
      ? `Still alive today, projected to live to age ${age}.`
      : age === 0
        ? 'Died before turning one.'
        : `Died at age ${age} in ${fmtYear(deathYear)}.`,
    !alive && cause ? `Cause of death: ${lowercaseFirst(cause)}.` : null,
  ]
    .filter((line): line is string => line !== null)
    .join(' ');

  for (let attempt = 1; attempt <= LIFE_STORY_ATTEMPTS; attempt++) {
    const content = await completeJson(LIFE_STORY_SYSTEM_PROMPT, facts);
    const single = Array.isArray(content) ? content[0] : content;
    const narrative = lifeStorySchema.parse(single);
    if (!findAnachronism({ story: narrative.story, year, deathYear })) {
      return { ...narrative, birthYear: year };
    }
  }
  throw new Error('Life story kept contradicting its era');
}

const populationSchema = z.object({
  low: z.number().positive(),
  mid: z.number().positive(),
  high: z.number().positive(),
});

const POPULATION_ATTEMPTS = 3;

const POPULATION_SYSTEM_PROMPT =
  'You estimate historical populations for a game, drawing on archaeological and historical scholarship. Reply with strict JSON: {"low": number, "mid": number, "high": number}, whole numbers of people living inside the given polity\'s territory in the given year: your best estimate and a plausible range, low <= mid <= high. The territory\'s area is given; averaged over a whole territory, density is usually well under 50 people per km² and never above 300. Never exceed the world population that year.';

/**
 * Asks an OpenRouter model how many people lived in a polity's territory in one year, checking the
 * answer against the territory's area and the world population and asking again (naming the
 * problem) when it doesn't add up. A researched `reference` figure, when there is one, anchors it.
 * Throws when every attempt is implausible.
 */
export async function generatePopulationEstimate(options: {
  name: string;
  year: number;
  place: SinPlaceContext;
  areaKm2: number;
  world: number;
  reference?: { year: number; population: number; areaKm2: number };
  /** The OpenRouter model to ask; historical figures need a stronger one than the default. */
  model?: string;
}): Promise<PopulationRange> {
  const { name, year, place, areaKm2, world, reference, model } = options;
  const facts = [
    `Polity: ${describePlace(name, place)}. Year: ${fmtYear(year)}.`,
    `Territory: about ${Math.round(areaKm2)} km². World population then: about ${Math.round(world)}.`,
    reference
      ? `A researched figure for this polity: about ${Math.round(reference.population)} people in ${fmtYear(reference.year)} across about ${Math.round(reference.areaKm2)} km²; stay consistent with it, adjusted for the territory and the year.`
      : null,
  ]
    .filter((line): line is string => line !== null)
    .join(' ');

  let problem: string | null = null;
  for (let attempt = 1; attempt <= POPULATION_ATTEMPTS; attempt++) {
    const content = await completeJson(
      POPULATION_SYSTEM_PROMPT,
      problem ? `${facts} Your previous answer was rejected: ${problem}.` : facts,
      model,
    );
    const parsed = populationSchema.parse(Array.isArray(content) ? content[0] : content);
    const estimate = {
      low: Math.round(parsed.low),
      mid: Math.round(parsed.mid),
      high: Math.round(parsed.high),
    };
    problem = checkPopulation({ estimate, areaKm2, world, year });
    if (!problem) return estimate;
  }
  throw new Error(`Population for ${name} (${fmtYear(year)}) stayed implausible: ${problem}`);
}
