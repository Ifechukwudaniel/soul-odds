import { describe, expect, it } from 'vitest';
import { countryDensityAt, countryIndex, populationFromCountries } from '@/lib/mortal-odds/density';

const italy = countryIndex('Italy') ?? -1;
const egypt = countryIndex('Egypt') ?? -1;

describe('countryIndex', () => {
  it('finds a country by name', () => {
    expect(italy).toBeGreaterThanOrEqual(0);
  });

  it("returns undefined for a name it doesn't know", () => {
    expect(countryIndex('Atlantis')).toBeUndefined();
  });
});

describe('countryDensityAt', () => {
  it('puts Italy at about 25 people per km² at the year 0', () => {
    expect(countryDensityAt({ country: italy, year: 0 })).toBeCloseTo(24.8, 0);
  });

  it('is denser in a later, more populous year', () => {
    expect(countryDensityAt({ country: italy, year: 1800 })).toBeGreaterThan(
      countryDensityAt({ country: italy, year: 100 }),
    );
  });

  it('gives a year between two time steps a figure between theirs', () => {
    const [before, mid, after] = [1750, 1775, 1800].map((year) =>
      countryDensityAt({ country: italy, year }),
    );
    expect(mid).toBeGreaterThan(before ?? 0);
    expect(mid).toBeLessThan(after ?? 0);
  });

  it("is zero for a country the table doesn't know", () => {
    expect(countryDensityAt({ country: 9999, year: 1500 })).toBe(0);
  });
});

describe('populationFromCountries', () => {
  it("adds up each country's density times the land covered there", () => {
    const year = 1500;
    const expected =
      countryDensityAt({ country: italy, year }) * 100_000 +
      countryDensityAt({ country: egypt, year }) * 50_000;
    expect(
      populationFromCountries({ year, landByCountry: { [italy]: 100_000, [egypt]: 50_000 } }),
    ).toBeCloseTo(expected);
  });

  it('scales with the land covered', () => {
    const small = populationFromCountries({ year: 1500, landByCountry: { [italy]: 100_000 } });
    expect(
      populationFromCountries({ year: 1500, landByCountry: { [italy]: 200_000 } }),
    ).toBeCloseTo(small * 2);
  });
});
