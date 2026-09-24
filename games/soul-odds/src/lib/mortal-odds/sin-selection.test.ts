import { describe, expect, it } from 'vitest';
import {
  categoriesOfCrimeMask,
  categoriesOfSinOption,
  crimeMaskOfSinOption,
  sinOptionId,
  sinsOf,
} from '@/lib/mortal-odds/sin-selection';
import type { Life, Sin } from '@/types';

const sin = (id: string): Sin => ({ id, label: id, phrase: `did ${id}`, from: 1900, to: null });
const LIFE: Life = {
  year: 1900,
  region: 'eur',
  sex: 'boy',
  age: 40,
  deathYear: 1940,
  shock: null,
  literate: true,
  city: false,
  sin: null,
};

describe('sinOptionId', () => {
  it('returns none for no sins', () => {
    expect(sinOptionId([])).toBe('none');
  });

  it("orders a pair by the contract's bit order whatever order it was named in", () => {
    expect(sinOptionId(['heresy', 'violence'])).toBe('violence+heresy');
  });

  it("ignores ids that aren't crime categories", () => {
    expect(sinOptionId(['none', 'greed'])).toBe('greed');
  });
});

describe('crimeMaskOfSinOption', () => {
  it("maps none, a single sin and a pair onto the contract's bits", () => {
    expect(crimeMaskOfSinOption('none')).toBe(0);
    expect(crimeMaskOfSinOption('deceit')).toBe(0b0010);
    expect(crimeMaskOfSinOption('violence+greed')).toBe(0b0101);
  });

  it('round-trips through the mask', () => {
    expect(sinOptionId(categoriesOfCrimeMask(crimeMaskOfSinOption('deceit+heresy')))).toBe(
      'deceit+heresy',
    );
    expect(categoriesOfSinOption('none')).toEqual([]);
  });
});

describe('sinsOf', () => {
  it('returns every recorded sin', () => {
    expect(
      sinsOf({ ...LIFE, sin: sin('violence'), sins: [sin('violence'), sin('greed')] }),
    ).toHaveLength(2);
  });

  it('falls back to the primary sin for lives without a sin list', () => {
    expect(sinsOf({ ...LIFE, sin: sin('violence') })).toEqual([sin('violence')]);
    expect(sinsOf(LIFE)).toEqual([]);
  });
});
