import { describe, expect, it } from 'vitest';
import {
  ERA_BY_PERIOD,
  epitaphs,
  eraOf,
  lintEpitaph,
  lintEpitaphs,
  matchesScenario,
  pickEpitaph,
  renderEpitaph,
  scenarioOf,
} from '@/lib/mortal-odds/epitaph';
import type { Epitaph } from '@/lib/mortal-odds/epitaph';
import { periodName } from '@/lib/mortal-odds/format';
import { mulberry32 } from '@/lib/mortal-odds/rng';
import type { Life } from '@/types';

const CURRENT_YEAR = 2026;

const life = (overrides: Partial<Life> = {}): Life => ({
  year: 1500,
  region: 'eur',
  sex: 'girl',
  age: 40,
  deathYear: 1540,
  shock: null,
  literate: false,
  city: false,
  sin: null,
  ...overrides,
});

const entry = (id: string, when: Epitaph['when'], text = 'A quiet line.'): Epitaph => ({
  id,
  text,
  when,
});

const pick = (l: Life, pool: Epitaph[], seed = 1, recent: string[] = []) =>
  pickEpitaph({
    life: l,
    currentYear: CURRENT_YEAR,
    placeName: 'Somewhere',
    rng: mulberry32(seed),
    recent,
    pool,
  });

describe('scenarioOf', () => {
  it.each([
    [0, 'infant'],
    [1, 'child'],
    [4, 'child'],
    [5, 'juvenile'],
    [15, 'juvenile'],
    [16, 'young'],
    [29, 'young'],
    [30, 'adult'],
    [44, 'adult'],
    [45, 'mature'],
    [59, 'mature'],
    [60, 'elder'],
    [79, 'elder'],
    [80, 'ancient'],
    [105, 'ancient'],
  ])('puts age %i in band %s', (age, band) => {
    expect(scenarioOf(life({ age }), CURRENT_YEAR).ageBand).toEqual([band]);
  });

  it('marks a life that reaches today as alive with a natural cause', () => {
    const scenario = scenarioOf(life({ deathYear: 2050 }), CURRENT_YEAR);
    expect(scenario.status).toEqual(['alive']);
    expect(scenario.cause).toEqual(['natural']);
  });

  it('tags a shock death with both the catastrophe kind and the shock id', () => {
    const shock = {
      id: 'black-death',
      label: 'Black Death',
      phrase: 'the Black Death',
      from: 1346,
      to: 1353,
    };
    expect(scenarioOf(life({ shock }), CURRENT_YEAR).cause).toEqual(['catastrophe', 'black-death']);
  });

  it('maps every period label to an era', () => {
    for (let year = -50000; year <= 2030; year++) {
      expect(Object.keys(ERA_BY_PERIOD), `year ${year}`).toContain(periodName(year));
    }
    expect(eraOf(-20000)).toBe('old-stone-age');
    expect(eraOf(1800)).toBe('industrial');
    expect(eraOf(2000)).toBe('modern');
  });
});

describe('matchesScenario', () => {
  const scenario = scenarioOf(life({ sex: 'girl', age: 3 }), CURRENT_YEAR);

  it('matches an entry with no conditions', () => {
    expect(matchesScenario(entry('any', {}), scenario)).toBe(true);
  });

  it('requires every named field to match', () => {
    expect(matchesScenario(entry('a', { sex: ['girl'], ageBand: ['child'] }), scenario)).toBe(true);
    expect(matchesScenario(entry('b', { sex: ['girl'], ageBand: ['elder'] }), scenario)).toBe(
      false,
    );
  });

  it('accepts any listed value within a field', () => {
    expect(matchesScenario(entry('c', { ageBand: ['infant', 'child'] }), scenario)).toBe(true);
  });
});

describe('pickEpitaph', () => {
  it('never picks an entry whose conditions the life fails', () => {
    const pool = [
      entry('boy-only', { sex: ['boy'] }),
      entry('girl-only', { sex: ['girl'] }),
      entry('elder-only', { ageBand: ['elder'] }),
    ];
    for (let seed = 1; seed <= 200; seed++) {
      expect(pick(life({ sex: 'girl', age: 40 }), pool, seed).id).toBe('girl-only');
    }
  });

  it('favours the more specific of two matching entries', () => {
    const pool = [
      entry('generic', {}),
      entry('specific', { sex: ['girl'], ageBand: ['adult'], setting: ['land'] }),
    ];
    let specific = 0;
    for (let seed = 1; seed <= 500; seed++) {
      if (pick(life({ age: 35 }), pool, seed).id === 'specific') specific++;
    }
    expect(specific).toBeGreaterThan(350);
  });

  it('skips recently shown ids while alternatives remain', () => {
    const pool = [entry('one', {}), entry('two', {})];
    for (let seed = 1; seed <= 50; seed++) {
      expect(pick(life(), pool, seed, ['one']).id).toBe('two');
    }
  });

  it('repeats a recent id rather than fail when it is the only match', () => {
    expect(pick(life(), [entry('only', {})], 1, ['only']).id).toBe('only');
  });

  it('falls back to a status-appropriate line when nothing matches', () => {
    expect(pick(life(), [entry('elder-only', { ageBand: ['elder'] })]).id).toBe('fallback');
  });

  it('is deterministic for a fixed seed', () => {
    expect(pick(life(), epitaphs, 7)).toEqual(pick(life(), epitaphs, 7));
  });
});

describe('renderEpitaph', () => {
  it('fills pronouns for a girl', () => {
    expect(
      renderEpitaph('{He} lost {his} way; the road took {him}.', life({ sex: 'girl' }), 'Ur'),
    ).toBe('She lost her way; the road took her.');
  });

  it('fills pronouns for a boy', () => {
    expect(
      renderEpitaph('{He} lost {his} way; the road took {him}.', life({ sex: 'boy' }), 'Ur'),
    ).toBe('He lost his way; the road took him.');
  });

  it('fills years, place and lifespan', () => {
    const text = renderEpitaph(
      '{born} in {place}, gone in {died}, after {lifespan}.',
      life({ year: 1500, deathYear: 1540, age: 40 }),
      'Ur',
    );
    expect(text).toBe('1500 in Ur, gone in 1540, after 40 years.');
  });

  it('capitalizes a sentence-initial cause and sin', () => {
    const shock = {
      id: 'black-death',
      label: 'Black Death',
      phrase: 'the Black Death',
      from: 1346,
      to: 1353,
    };
    const sin = { id: 'greed', label: 'Theft', phrase: 'stole to get by', from: -50000, to: null };
    expect(
      renderEpitaph('{Cause} came; {sin} and {Sin}; {he} {sinPhrase}.', life({ shock, sin }), 'Ur'),
    ).toBe('The Black Death came; theft and Theft; she stole to get by.');
  });

  it('phrases a sub-year lifespan', () => {
    expect(renderEpitaph('{lifespan}', life({ age: 0 }), 'Ur')).toBe('less than a year');
  });
});

describe('lintEpitaph', () => {
  const problemsFor = (text: string, when: Epitaph['when']) => lintEpitaph({ id: 't', text, when });

  it('accepts a plain, safely-tagged line', () => {
    expect(problemsFor('The road was long and quiet.', { status: ['dead'] })).toEqual([]);
  });

  it('rejects values outside the vocabulary', () => {
    expect(problemsFor('A quiet line here.', { ageBand: ['teen'] })).toHaveLength(1);
  });

  it('rejects hard-coded digits and unknown placeholders', () => {
    expect(problemsFor('Gone at 12, sadly.', {})).toHaveLength(1);
    expect(problemsFor('{nickname} is gone.', {})).toHaveLength(1);
  });

  it('requires a tag that guarantees the data behind a placeholder', () => {
    expect(problemsFor('Taken by {cause}, quietly.', {})).toHaveLength(1);
    expect(problemsFor('Taken by {cause}, quietly.', { cause: ['black-death'] })).toEqual([]);
    expect(problemsFor('Gone at {age}, quietly.', { status: ['alive'] })).toHaveLength(1);
  });

  it('requires a sex tag for gendered wording', () => {
    expect(problemsFor('She never looked back.', {})).toHaveLength(1);
    expect(problemsFor('She never looked back.', { sex: ['boy'] })).toHaveLength(1);
    expect(problemsFor('She never looked back.', { sex: ['girl'] })).toEqual([]);
  });

  it('requires tags for wording that only fits some lives', () => {
    expect(problemsFor('The plague found everyone in the end.', {})).toHaveLength(1);
    expect(problemsFor('A thief in the market square.', {})).toHaveLength(2);
    expect(
      problemsFor('Never learned to read, but knew the fields.', {
        literacy: ['illiterate'],
        setting: ['land'],
      }),
    ).toEqual([]);
  });

  it('flags an entry no life can match', () => {
    expect(
      problemsFor('A quiet ending, overall.', { status: ['alive'], cause: ['catastrophe'] }),
    ).toHaveLength(1);
  });
});

describe('epitaphs.json', () => {
  it('has no lint problems, duplicates or coverage gaps', () => {
    expect(lintEpitaphs(epitaphs)).toEqual([]);
  });

  it('gives every status and age band at least one line for any life', () => {
    for (const status of ['alive', 'dead']) {
      for (const age of [0, 3, 10, 20, 35, 50, 70, 90]) {
        const deathYear = status === 'alive' ? 2050 : 1900;
        expect(pick(life({ age, deathYear }), epitaphs).id, `${status} ${age}`).not.toBe(
          'fallback',
        );
      }
    }
  });
});
