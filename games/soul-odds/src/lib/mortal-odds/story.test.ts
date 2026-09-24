import { describe, expect, it } from 'vitest';
import { jobsConfig } from '@/lib/mortal-odds/config';
import { mulberry32 } from '@/lib/mortal-odds/rng';
import { tellStory } from '@/lib/mortal-odds/story';
import type { Life, Place } from '@/types';

const PLACE: Place = { name: 'the Ganges Plain, Asia', share: 0.2, lat: 26, lon: 82 };

function life(overrides: Partial<Life>): Life {
  return {
    year: 1900,
    region: 'sas',
    sex: 'boy',
    age: 40,
    deathYear: 1940,
    shock: null,
    literate: true,
    city: true,
    sin: null,
    ...overrides,
  };
}

describe('tellStory', () => {
  it('mentions being alive today when the death year is in the future', () => {
    const story = tellStory({
      life: life({ deathYear: 3000, age: 70 }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.3,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/alive today/);
  });

  it("mentions the catastrophe's phrase when the death was caused by a shock", () => {
    const story = tellStory({
      life: life({
        shock: { id: 'x', label: 'Test War', phrase: 'a test war', from: 1914, to: 1918 },
      }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.3,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/a test war/);
  });

  it('uses the before-turning-one line for an age-0 death', () => {
    const story = tellStory({
      life: life({ age: 0, deathYear: 1900 }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.4,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/before turning one/);
    expect(story).toMatch(/in 10 children/);
  });

  it('skips the job sentence for someone who never grows up', () => {
    const story = tellStory({
      life: life({ age: 10, deathYear: 1910 }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.1,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).not.toMatch(/works as/);
  });

  it('mentions the sin even for a life that never grows up', () => {
    const story = tellStory({
      life: life({
        age: 10,
        deathYear: 1910,
        sin: {
          id: 'violence',
          label: 'Violence',
          phrase: 'started a fight that turned deadly',
          from: 1900,
          to: null,
        },
      }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.1,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/started a fight that turned deadly/);
  });

  it('lowercases a capitalized sin phrase to embed it mid-sentence', () => {
    const story = tellStory({
      life: life({
        sin: {
          id: 'violence',
          label: 'Violence',
          phrase: "Slashed the rival's throat in a dark alley",
          from: 1900,
          to: null,
        },
      }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.1,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/Along the way, he slashed the rival's throat in a dark alley\./);
  });

  it('includes a job sentence for a grown adult', () => {
    const story = tellStory({
      life: life({ age: 40, deathYear: 1940 }),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.1,
      jobs: jobsConfig,
      rng: mulberry32(1),
    });
    expect(story).toMatch(/works as/);
  });

  it('is deterministic for a fixed seed', () => {
    const options = {
      life: life({}),
      place: PLACE,
      currentYear: 2024,
      childDeathShare: 0.1,
      jobs: jobsConfig,
    };
    const a = tellStory({ ...options, rng: mulberry32(7) });
    const b = tellStory({ ...options, rng: mulberry32(7) });
    expect(a).toBe(b);
  });
});
