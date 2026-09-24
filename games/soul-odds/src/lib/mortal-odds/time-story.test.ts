import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/lib/mortal-odds/rng';
import {
  FIRST_YEAR,
  lintTimeStories,
  lintTimeStory,
  pickTimeStory,
  renderTimeStory,
  timeStories,
} from '@/lib/mortal-odds/time-story';
import type { TimeStory } from '@/lib/mortal-odds/time-story';

const story = (
  id: string,
  from: number,
  to: number,
  text = 'A quiet stretch of history, much like the rest.',
): TimeStory => ({ id, from, to, text });

const pick = (year: number, pool: TimeStory[], seed = 1, recent: string[] = []) =>
  pickTimeStory({ year, rng: mulberry32(seed), recent, pool });

describe('pickTimeStory', () => {
  it('only picks stories whose range contains the year', () => {
    const pool = [story('early', -500, 0), story('mid', 1000, 1100), story('late', 1900, 1950)];
    for (let seed = 1; seed <= 100; seed++) {
      expect(pick(1050, pool, seed).id).toBe('mid');
    }
  });

  it('includes both ends of a range', () => {
    const pool = [story('only', 1914, 1918)];
    expect(pick(1914, pool).id).toBe('only');
    expect(pick(1918, pool).id).toBe('only');
    expect(pick(1913, pool).id).toBe('fallback');
    expect(pick(1919, pool).id).toBe('fallback');
  });

  it('favours the narrower of two overlapping ranges', () => {
    const pool = [story('wide', -1000, 1500), story('narrow', 1200, 1260)];
    let narrow = 0;
    for (let seed = 1; seed <= 500; seed++) {
      if (pick(1230, pool, seed).id === 'narrow') narrow++;
    }
    expect(narrow).toBeGreaterThan(400);
  });

  it('skips recently shown ids while alternatives remain', () => {
    const pool = [story('one', 0, 100), story('two', 0, 100)];
    for (let seed = 1; seed <= 50; seed++) {
      expect(pick(50, pool, seed, ['one']).id).toBe('two');
    }
  });

  it('repeats a recent id rather than fail when it is the only match', () => {
    expect(pick(50, [story('only', 0, 100)], 1, ['only']).id).toBe('only');
  });

  it('returns an empty line when nothing covers the year', () => {
    expect(pick(50, [story('far', 500, 600)])).toEqual({ id: 'fallback', text: '' });
  });

  it('is deterministic for a fixed seed', () => {
    expect(pick(1925, timeStories, 7)).toEqual(pick(1925, timeStories, 7));
  });
});

describe('renderTimeStory', () => {
  it('fills the population placeholder for the year', () => {
    expect(renderTimeStory('About {people} people lived then.', 1900)).toMatch(
      /^About .+ people lived then\.$/,
    );
    expect(renderTimeStory('About {people} people lived then.', 1900)).not.toContain('{');
  });
});

describe('lintTimeStory', () => {
  const problemsFor = (from: number, to: number, text: string) =>
    lintTimeStory({ id: 't', from, to, text });

  it('accepts a plain story', () => {
    expect(
      problemsFor(
        1914,
        1918,
        'The world was at war, and millions of young men were sent away from home.',
      ),
    ).toEqual([]);
  });

  it('rejects an inverted or out-of-bounds range', () => {
    expect(
      problemsFor(1950, 1900, 'The world was at war, and millions of young men were sent away.'),
    ).toHaveLength(1);
    expect(
      problemsFor(-60000, -50000, 'Small bands followed the herds across the frozen plains.'),
    ).toHaveLength(1);
    expect(
      problemsFor(
        2000,
        3000,
        'The internet reached almost everywhere, and news crossed the planet.',
      ),
    ).toHaveLength(1);
  });

  it('rejects digits, unknown placeholders and bad lengths', () => {
    expect(
      problemsFor(1914, 1918, 'The war that began in 1914 spread across the whole wide world.'),
    ).toHaveLength(1);
    expect(
      problemsFor(1914, 1918, 'The war spread and {year} became a year nobody forgot.'),
    ).toHaveLength(1);
    expect(problemsFor(1914, 1918, 'Too short.')).toHaveLength(1);
  });

  it('rejects wording from a later age than the range starts', () => {
    expect(
      problemsFor(1800, 1849, 'The first railways were stitching towns together across the land.'),
    ).toHaveLength(1);
    expect(
      problemsFor(1825, 1849, 'The first railways were stitching towns together across the land.'),
    ).toEqual([]);
    expect(
      problemsFor(
        -50000,
        -10001,
        'Coins and cities were unknown, and the herds were all that mattered.',
      ),
    ).toHaveLength(2);
  });

  it('does not flag the placeholder itself', () => {
    expect(
      problemsFor(-50000, -10001, 'Only {people} people were alive in the whole wide world.'),
    ).toEqual([]);
  });
});

describe('lintTimeStories', () => {
  it('flags year gaps and duplicate ids', () => {
    const list = [
      story('a', -50000, 1000, 'One quiet story about the long early history.'),
      story('a', -50000, 1000, 'Another quiet story about the long early history.'),
    ];
    const problems = lintTimeStories(list, 1200);
    expect(problems.some((problem) => problem.includes('id is used more than once'))).toBe(true);
    expect(
      problems.some((problem) => problem.includes('coverage') && problem.includes('1001..1200')),
    ).toBe(true);
  });
});

describe('time-stories.json', () => {
  it('has no lint problems, duplicates or coverage gaps', () => {
    expect(lintTimeStories(timeStories)).toEqual([]);
  });

  it('gives every year in the game a line', () => {
    for (let year = FIRST_YEAR; year <= new Date().getFullYear(); year += 13) {
      expect(pick(year, timeStories).id, `year ${year}`).not.toBe('fallback');
    }
  });
});
