import { describe, expect, it } from 'vitest';
import { findAnachronism } from '@/lib/mortal-odds/life-story-lint';

describe('findAnachronism', () => {
  it('flags archaic weapons in a modern life', () => {
    const story = 'Rahim raining arrows upon the rival encampments.';
    expect(findAnachronism({ story, year: 2012, deathYear: 2052 })).toBe('arrows');
  });

  it('allows archaic weapons in an ancient life', () => {
    const story = 'Rahim raining arrows upon the rival encampments.';
    expect(findAnachronism({ story, year: 1200, deathYear: 1240 })).toBeNull();
  });

  it('allows a modern life with no archaic words', () => {
    const story = "Rahim tended his family's orchard until the drought came.";
    expect(findAnachronism({ story, year: 2012, deathYear: 2052 })).toBeNull();
  });
});
