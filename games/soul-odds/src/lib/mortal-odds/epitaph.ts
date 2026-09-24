import * as z from 'zod';
import epitaphsJson from '@/config/mortal-odds/epitaphs.json';
import { placesConfig, shocksConfig, SIN_CATEGORIES } from '@/lib/mortal-odds/config';
import { fmtYear, lowercaseFirst, periodName } from '@/lib/mortal-odds/format';
import { pickWeighted } from '@/lib/mortal-odds/rng';
import type { Rng } from '@/lib/mortal-odds/rng';
import type { Life } from '@/types';

export const CONDITION_FIELDS = [
  'status',
  'ageBand',
  'sex',
  'cause',
  'literacy',
  'setting',
  'sin',
  'era',
  'region',
] as const;
export type ConditionField = (typeof CONDITION_FIELDS)[number];

const AGE_BANDS = [
  { id: 'infant', to: 0 },
  { id: 'child', to: 4 },
  { id: 'juvenile', to: 15 },
  { id: 'young', to: 29 },
  { id: 'adult', to: 44 },
  { id: 'mature', to: 59 },
  { id: 'elder', to: 79 },
  { id: 'ancient', to: Number.POSITIVE_INFINITY },
] as const;

export const ERA_BY_PERIOD: Record<string, string> = {
  'Old Stone Age': 'old-stone-age',
  'New Stone Age': 'new-stone-age',
  'Bronze Age': 'bronze-age',
  'Iron Age': 'iron-age',
  'Classical era': 'classical',
  'Middle Ages': 'middle-ages',
  'Early modern era': 'early-modern',
  'Industrial age': 'industrial',
  'Modern era': 'modern',
};

const SHOCK_IDS = shocksConfig.map((shock) => shock.id);
const SIN_CATEGORY_IDS: string[] = SIN_CATEGORIES.map((category) => category.id);
const CATASTROPHE_VALUES = ['catastrophe', ...SHOCK_IDS];

/** Every value an epitaph's `when` may name, per field. The single source of truth the lint and the model prompt share. */
export const VOCABULARY: Record<ConditionField, readonly string[]> = {
  status: ['alive', 'dead'],
  ageBand: AGE_BANDS.map((band) => band.id),
  sex: ['girl', 'boy'],
  cause: ['natural', ...CATASTROPHE_VALUES],
  literacy: ['literate', 'illiterate'],
  setting: ['city', 'land'],
  sin: ['clean', ...SIN_CATEGORY_IDS],
  era: Object.values(ERA_BY_PERIOD),
  region: Object.keys(placesConfig),
};

const conditionValues = z.array(z.string()).min(1).optional();

const epitaphSchema = z.strictObject({
  id: z.string().min(1),
  text: z.string().min(1),
  when: z.strictObject({
    status: conditionValues,
    ageBand: conditionValues,
    sex: conditionValues,
    cause: conditionValues,
    literacy: conditionValues,
    setting: conditionValues,
    sin: conditionValues,
    era: conditionValues,
    region: conditionValues,
  }),
});

export type Epitaph = z.infer<typeof epitaphSchema>;

export const epitaphs: Epitaph[] = z.array(epitaphSchema).parse(epitaphsJson);

export type Scenario = Record<ConditionField, string[]>;

function ageBandOf(age: number): string {
  return AGE_BANDS.find((band) => age <= band.to)?.id ?? 'ancient';
}

export function eraOf(year: number): string {
  return ERA_BY_PERIOD[periodName(year)] ?? 'modern';
}

/** The facts about a life an epitaph can be conditioned on, as the same vocabulary an epitaph's `when` uses. */
export function scenarioOf(life: Life, currentYear: number): Scenario {
  const alive = life.deathYear >= currentYear;
  return {
    status: [alive ? 'alive' : 'dead'],
    ageBand: [ageBandOf(life.age)],
    sex: [life.sex],
    cause: life.shock && !alive ? ['catastrophe', life.shock.id] : ['natural'],
    literacy: [life.literate ? 'literate' : 'illiterate'],
    setting: [life.city ? 'city' : 'land'],
    sin: [life.sin ? life.sin.id : 'clean'],
    era: [eraOf(life.year)],
    region: [life.region],
  };
}

/** Fields are AND-ed, values within a field are OR-ed, and an absent field matches anything. */
export function matchesScenario(epitaph: Epitaph, scenario: Scenario): boolean {
  return CONDITION_FIELDS.every((field) => {
    const wanted = epitaph.when[field];
    return wanted === undefined || wanted.some((value) => scenario[field].includes(value));
  });
}

const specificity = (epitaph: Epitaph) =>
  CONDITION_FIELDS.filter((field) => epitaph.when[field] !== undefined).length;

type TokenRule = { field: ConditionField; allowed: readonly string[] } | null;

const DEAD_ONLY: TokenRule = { field: 'status', allowed: ['dead'] };
const SIN_ONLY: TokenRule = { field: 'sin', allowed: SIN_CATEGORY_IDS };
const CAUSE_ONLY: TokenRule = { field: 'cause', allowed: CATASTROPHE_VALUES };

/** Placeholders an epitaph's text may use; a rule means the epitaph's `when` must guarantee the data exists. */
const TOKEN_RULES = {
  he: null,
  He: null,
  his: null,
  His: null,
  him: null,
  Him: null,
  place: null,
  born: null,
  age: DEAD_ONLY,
  lifespan: DEAD_ONLY,
  died: DEAD_ONLY,
  cause: CAUSE_ONLY,
  Cause: CAUSE_ONLY,
  sin: SIN_ONLY,
  Sin: SIN_ONLY,
  sinPhrase: SIN_ONLY,
} as const;

type TokenName = keyof typeof TOKEN_RULES;

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

function lifespanPhrase(age: number): string {
  if (age === 0) return 'less than a year';
  return age === 1 ? 'one year' : `${age} years`;
}

function tokensFor(life: Life, placeName: string): Record<TokenName, string> {
  const pronouns =
    life.sex === 'girl'
      ? { he: 'she', his: 'her', him: 'her' }
      : { he: 'he', his: 'his', him: 'him' };
  return {
    he: pronouns.he,
    He: capitalize(pronouns.he),
    his: pronouns.his,
    His: capitalize(pronouns.his),
    him: pronouns.him,
    Him: capitalize(pronouns.him),
    place: placeName,
    born: fmtYear(life.year),
    age: String(life.age),
    lifespan: lifespanPhrase(life.age),
    died: fmtYear(life.deathYear),
    cause: life.shock?.phrase ?? '',
    Cause: capitalize(life.shock?.phrase ?? ''),
    sin: life.sin?.label.toLowerCase() ?? '',
    Sin: life.sin?.label ?? '',
    sinPhrase: life.sin ? lowercaseFirst(life.sin.phrase) : '',
  };
}

const isTokenName = (name: string): name is TokenName => name in TOKEN_RULES;

/** Fills an epitaph's `{placeholders}` from the life. */
export function renderEpitaph(text: string, life: Life, placeName: string): string {
  const tokens = tokensFor(life, placeName);
  return text.replace(/\{(\w+)\}/g, (match, name: string) =>
    isTokenName(name) ? tokens[name] : match,
  );
}

const FALLBACKS = {
  alive: 'The story is not over yet.',
  dead: 'Remembered, if only by the scales.',
};

/**
 * Picks one epitaph that is true of this life: only entries whose every `when` condition matches
 * are eligible, more specific entries are likelier, and ids in `recent` are skipped while
 * alternatives remain so consecutive rounds don't repeat a line.
 */
export function pickEpitaph(options: {
  life: Life;
  currentYear: number;
  placeName: string;
  rng: Rng;
  recent?: readonly string[];
  pool?: Epitaph[];
}): { id: string; text: string } {
  const { life, currentYear, placeName, rng, recent = [], pool = epitaphs } = options;
  const scenario = scenarioOf(life, currentYear);
  const matching = pool.filter((epitaph) => matchesScenario(epitaph, scenario));
  const fresh = matching.filter((epitaph) => !recent.includes(epitaph.id));
  const candidates = fresh.length > 0 ? fresh : matching;

  if (candidates.length === 0) {
    return { id: 'fallback', text: FALLBACKS[scenario.status[0] === 'alive' ? 'alive' : 'dead'] };
  }

  const chosen = pickWeighted({
    items: candidates,
    weight: (epitaph) => 2 ** specificity(epitaph),
    rng,
  });
  return { id: chosen.id, text: renderEpitaph(chosen.text, life, placeName) };
}

type Guard = { pattern: RegExp; field: ConditionField; allowed: readonly string[] };

/**
 * Wording that would be false for some lives unless the epitaph's `when` rules them out: e.g. a line
 * about "the plague" must be limited to catastrophe causes. Keep the model prompt's rules in sync.
 */
const GUARDS: Guard[] = [
  {
    pattern: /\b(child|children|infant|baby|cradle|newborn|toddler)\b/i,
    field: 'ageBand',
    allowed: ['infant', 'child', 'juvenile'],
  },
  {
    pattern:
      /\b(elder|elders|grandmother|grandfather|grandchildren|grey|gray|white hair|old age)\b/i,
    field: 'ageBand',
    allowed: ['elder', 'ancient'],
  },
  {
    pattern: /\b(died|dead|buried|grave|tomb|laid to rest)\b/i,
    field: 'status',
    allowed: ['dead'],
  },
  {
    pattern:
      /\b(plague|pandemic|epidemic|war|wars|famine|battle|soldier|rebellion|invasion|conquest|pestilence)\b/i,
    field: 'cause',
    allowed: CATASTROPHE_VALUES,
  },
  {
    pattern:
      /\b(thief|steal|stole|stolen|murder|murdered|robbed|sin|sins|sinned|guilty|crime|criminal|heresy|heretic|forged|fraud|bribe|bribed|smuggled|adultery|pirate|perjury)\b/i,
    field: 'sin',
    allowed: SIN_CATEGORY_IDS,
  },
  { pattern: /\b(innocent|blameless|sinless|unstained)\b/i, field: 'sin', allowed: ['clean'] },
  {
    pattern: /\b(city|cities|street|streets|urban|market)\b/i,
    field: 'setting',
    allowed: ['city'],
  },
  {
    pattern:
      /\b(field|fields|farm|farmer|village|villages|harvest|plough|plow|herd|pasture|countryside|soil)\b/i,
    field: 'setting',
    allowed: ['land'],
  },
  {
    pattern: /\b(scribe|scribes|ink|scroll|scrolls|literate|letters)\b/i,
    field: 'literacy',
    allowed: ['literate'],
  },
  {
    pattern: /\b(unlettered|illiterate|never learned to read|could not read|never read)\b/i,
    field: 'literacy',
    allowed: ['illiterate'],
  },
  {
    pattern:
      /\b(she|her|hers|herself|girl|daughter|wife|mother|sister|maiden|lady|queen|widow|woman)\b/i,
    field: 'sex',
    allowed: ['girl'],
  },
  {
    pattern: /\b(he|his|him|himself|boy|son|husband|father|brother|lad|lord|king|widower|man)\b/i,
    field: 'sex',
    allowed: ['boy'],
  },
];

const MIN_LENGTH = 8;
export const MAX_LENGTH = 120;

/** Everything wrong with one epitaph, as readable sentences; empty when it is safe to ship. */
export function lintEpitaph(epitaph: Epitaph): string[] {
  const problems: string[] = [];
  const label = `[${epitaph.id}]`;
  const restrictedTo = (field: ConditionField, allowed: readonly string[]) => {
    const wanted = epitaph.when[field];
    return wanted !== undefined && wanted.every((value) => allowed.includes(value));
  };

  for (const field of CONDITION_FIELDS) {
    for (const value of epitaph.when[field] ?? []) {
      if (!VOCABULARY[field].includes(value))
        problems.push(`${label} when.${field} has unknown value "${value}"`);
    }
  }

  if (epitaph.text.length < MIN_LENGTH || epitaph.text.length > MAX_LENGTH) {
    problems.push(
      `${label} text must be ${MIN_LENGTH}-${MAX_LENGTH} characters, got ${epitaph.text.length}`,
    );
  }
  if (/\d/.test(epitaph.text))
    problems.push(`${label} text contains a digit; use {age}, {born} or {died}`);

  for (const [, name] of epitaph.text.matchAll(/\{(\w*)\}/g)) {
    if (!name || !isTokenName(name)) {
      problems.push(`${label} text uses unknown placeholder {${name}}`);
      continue;
    }
    const rule = TOKEN_RULES[name];
    if (rule && !restrictedTo(rule.field, rule.allowed)) {
      problems.push(
        `${label} uses {${name}} so when.${rule.field} must be limited to [${rule.allowed.join(', ')}]`,
      );
    }
  }

  const withoutTokens = epitaph.text.replace(/\{\w+\}/g, ' ');
  if (/[{}]/.test(withoutTokens)) problems.push(`${label} text has a stray brace`);

  for (const guard of GUARDS) {
    const hit = withoutTokens.match(guard.pattern)?.[0];
    if (hit && !restrictedTo(guard.field, guard.allowed)) {
      problems.push(
        `${label} text says "${hit}" so when.${guard.field} must be limited to [${guard.allowed.join(', ')}]`,
      );
    }
  }

  if (restrictedTo('status', ['alive']) && restrictedTo('cause', CATASTROPHE_VALUES)) {
    problems.push(`${label} can never match: a living soul was not killed by a catastrophe`);
  }

  return problems;
}

/** Minimum generic (status/ageBand-only) epitaphs every status × age band must have, so no life is ever left without a line. */
export const MIN_BASELINE = 2;

function isBaseline(epitaph: Epitaph): boolean {
  return CONDITION_FIELDS.every(
    (field) => field === 'status' || field === 'ageBand' || epitaph.when[field] === undefined,
  );
}

/** Lint for the whole file: per-entry problems, duplicate ids/texts, and status × age band cells without enough baseline lines. */
export function lintEpitaphs(list: Epitaph[]): string[] {
  const problems = list.flatMap(lintEpitaph);
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  for (const epitaph of list) {
    if (seenIds.has(epitaph.id)) problems.push(`[${epitaph.id}] id is used more than once`);
    seenIds.add(epitaph.id);
    const key = epitaph.text.trim().toLowerCase();
    if (seenTexts.has(key)) problems.push(`[${epitaph.id}] text duplicates another epitaph`);
    seenTexts.add(key);
  }

  const baselines = list.filter(isBaseline);
  for (const status of VOCABULARY.status) {
    for (const ageBand of VOCABULARY.ageBand) {
      const scenario: Scenario = {
        status: [status],
        ageBand: [ageBand],
        sex: [],
        cause: [],
        literacy: [],
        setting: [],
        sin: [],
        era: [],
        region: [],
      };
      const count = baselines.filter((epitaph) => matchesScenario(epitaph, scenario)).length;
      if (count < MIN_BASELINE)
        problems.push(
          `coverage: status "${status}" + ageBand "${ageBand}" has ${count} baseline epitaphs, needs ${MIN_BASELINE}`,
        );
    }
  }

  return problems;
}
