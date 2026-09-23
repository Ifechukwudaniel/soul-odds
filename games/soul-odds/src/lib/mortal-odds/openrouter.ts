import * as z from "zod";
import { Env } from "@/libs/Env";
import { SIN_CATEGORIES } from "@/lib/mortal-odds/config";
import { fmtYear } from "@/lib/mortal-odds/format";
import type { SinCategoryId } from "@/lib/mortal-odds/config";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "mistralai/mistral-nemo";

/**
 * Calls the chat completions endpoint and returns the parsed JSON content as-is (could be an
 * object or an array — this model doesn't reliably follow "reply with a JSON object" over "reply
 * with a JSON array", so callers handle whichever shape their prompt actually gets back).
 * Throws on a missing key, request failure, or a response that isn't valid JSON.
 */
async function completeJson(systemPrompt: string, userPrompt: string): Promise<unknown> {
  const apiKey = Env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const startedAt = Date.now();
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  console.log(`[openrouter] ${MODEL} responded in ${Date.now() - startedAt}ms (status ${response.status})`);

  if (!response.ok) {
    throw new Error(`OpenRouter request failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter response had no content");
  }

  return JSON.parse(content) as unknown;
}

const CATEGORY_ORDER = SIN_CATEGORIES.map((category) => category.id) as [SinCategoryId, ...SinCategoryId[]];

const sinEntrySchema = z.object({
  label: z.string().min(1).max(40),
  phrase: z.string().min(1).max(160),
});

const narrativesSchema = z.object(
  Object.fromEntries(SIN_CATEGORIES.map((category) => [category.id, sinEntrySchema])) as Record<
    SinCategoryId,
    typeof sinEntrySchema
  >,
);

export type SinNarratives = z.infer<typeof narrativesSchema>;

const sinNarrativesCache = new Map<string, SinNarratives>();
const SIN_NARRATIVES_CACHE_MAX_ENTRIES = 2000;

/**
 * This model reliably returns a plain JSON array (one entry per category, in prompt order) far
 * more often than the requested keyed object — key the array up by `CATEGORY_ORDER` before
 * validating, and fall through to validating the raw shape directly if it wasn't an array.
 */
function keyNarrativesByCategory(content: unknown): unknown {
  if (!Array.isArray(content) || content.length !== CATEGORY_ORDER.length) {
    return content;
  }
  return Object.fromEntries(CATEGORY_ORDER.map((category, index) => [category, content[index]]));
}

/**
 * Asks an OpenRouter model for one era-and-place-specific sin narrative per on-chain crime
 * category — flavor text only, generated fresh per (year, location) instead of drawn from
 * `sins.json`'s static catalog. All four categories are generated up front, in one call, because
 * the contract itself never knows which sin was committed: it only rolls a `crimeMask` (which
 * category slot(s) matched) on-chain, and the matching category's flavor text is picked
 * afterward — same as `pickCategoryFlavorSin` already does against the static catalog.
 * Throws on a missing key, request failure, or a response that doesn't fit the expected shape.
 */
export async function generateSinNarratives(options: { year: number; location: string }): Promise<SinNarratives> {
  const { year, location } = options;
  const key = `${year}|${location}`;
  const cached = sinNarrativesCache.get(key);
  if (cached) {
    sinNarrativesCache.delete(key);
    return cached;
  }

  const categoryList = SIN_CATEGORIES.map((entry) => `"${entry.id}" (${entry.label})`).join(", ");

  const content = await completeJson(
    `You write short, period-accurate crime flavor text for a historical fortune-telling game. Reply with strict JSON: a 4-element array, one entry per crime category in exactly this order: ${categoryList}. Each entry is shaped {"label": string, "phrase": string}. Each \`label\` is a short crime name (1-3 words, title case, e.g. "Grave robbery") fitting that specific category. Each \`phrase\` is a single past-tense clause describing the act in third person without a subject, matching the style "stole to get by" or "held up a traveler on the road" (no name, no "they"/"he"/"she", under 15 words, no trailing period).`,
    `Era: ${fmtYear(year)}. Place: ${location}.`,
  );

  const narratives = narrativesSchema.parse(keyNarrativesByCategory(content));

  if (sinNarrativesCache.size >= SIN_NARRATIVES_CACHE_MAX_ENTRIES) {
    const oldestKey = sinNarrativesCache.keys().next().value;
    if (oldestKey !== undefined) {
      sinNarrativesCache.delete(oldestKey);
    }
  }
  sinNarrativesCache.set(key, narratives);

  return narratives;
}

const lifeStorySchema = z.object({ story: z.string().min(1).max(1200) });

export type LifeStoryNarrative = z.infer<typeof lifeStorySchema> & { birthYear: number };


export async function generateLifeStory(options: {
  sex: "girl" | "boy";
  year: number;
  location: string;
  age: number;
  deathYear: number;
  sinPhrase: string | null;
}): Promise<LifeStoryNarrative> {
  const { sex, year, location, age, deathYear, sinPhrase } = options;

  const facts = [
    `Born ${sex === "girl" ? "a girl" : "a boy"} in ${location}, ${fmtYear(year)}.`,
    sinPhrase ? `Along the way, ${sinPhrase}.` : null,
    age === 0 ? "Died before turning one." : `Died at age ${age} in ${fmtYear(deathYear)}.`,
  ]
    .filter((line): line is string => line !== null)
    .join(" ");

  const content = await completeJson(
    'You write short, period-accurate prose life stories for a historical fortune-telling game, expanding a bare list of facts into 3-5 flowing sentences. Reply with strict JSON: {"story": string}. Stay third person, past tense, no invented names, no dialogue, period-appropriate detail for the given era and place. Do not contradict or omit any given fact.',
    facts,
  );

  const single = Array.isArray(content) ? content[0] : content;
  return { ...lifeStorySchema.parse(single), birthYear: year };
}
