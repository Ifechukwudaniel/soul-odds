import * as z from "zod";
import countryPopulationsJson from "@/config/mortal-odds/country-populations.json";

// Country populations come from Our World in Data's "Population" long-run series (population-long-run-with-projections;
// HYDE 3.3 before 1800, Gapminder to 1949, UN WPP 2024 after, medium-variant projections to 2100), which
// `scripts/build-country-population.ts` turns into country-populations.json along with each country's land
// area. Countries are in today's borders, so a country's density in a year is its population over its land,
// and a historical territory gets the density of each modern country it overlaps times the land it covers there.

const countryPopulationsSchema = z.object({
  years: z.array(z.number()),
  countries: z.array(z.object({ name: z.string(), landKm2: z.number(), population: z.array(z.number()) })),
});

const { years, countries } = countryPopulationsSchema.parse(countryPopulationsJson);

/** Land area in km² per country (its index in country-populations.json), e.g. `{ 41: 1_200_000, 7: 300_000 }` for a territory across two countries. */
export type LandByCountry = Record<number, number>;

/** Interpolates a series between its years: geometrically while it is growing from a non-zero value, otherwise in a line. */
function atYear(values: number[], year: number): number {
  const last = years.length - 1;
  if (year <= (years[0] ?? 0)) return values[0] ?? 0;
  if (year >= (years[last] ?? 0)) return values[last] ?? 0;
  const next = years.findIndex((step) => step >= year);
  const [y0, y1] = [years[next - 1] ?? 0, years[next] ?? 0];
  const [v0, v1] = [values[next - 1] ?? 0, values[next] ?? 0];
  const t = (year - y0) / (y1 - y0);
  return v0 > 0 && v1 > 0 ? v0 * (v1 / v0) ** t : v0 + (v1 - v0) * t;
}

/** People per km² across a country in a year, or 0 for a country the table doesn't know. */
export function countryDensityAt(options: { country: number; year: number }): number {
  const country = countries[options.country];
  return country && country.landKm2 > 0 ? atYear(country.population, options.year) / country.landKm2 : 0;
}

/** The people a territory held in a year: each country's density then times the land the territory covers in it. */
export function populationFromCountries(options: { year: number; landByCountry: LandByCountry }): number {
  const { year, landByCountry } = options;
  return Object.entries(landByCountry).reduce((sum, [country, km2]) => sum + countryDensityAt({ country: Number(country), year }) * km2, 0);
}

/** The index of a country in the table by name, e.g. "Italy", or undefined. */
export function countryIndex(name: string): number | undefined {
  const index = countries.findIndex((country) => country.name === name);
  return index === -1 ? undefined : index;
}
