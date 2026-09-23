import { centroidOf, loadCliopatria } from "@/lib/mortal-odds/cliopatria";
import type { CliopatriaFeature } from "@/lib/mortal-odds/cliopatria";
import { periodOf } from "@/lib/mortal-odds/sin-variants";

/** One piece of work per fixed window (see `periodOf`) that a Cliopatria polity's span touches. */
export type WindowJob = {
  name: string;
  /** The year the window's data is written for: the middle of the part of the window the polity covers. */
  year: number;
  window: { fromYear: number; toYear: number };
  /** Where the polity's territory was centred in `year`, plus the years the polity as a whole lasted. */
  place: { lat: number; lon: number; fromYear: number; toYear: number };
  areaKm2: number;
  wikidata: string;
  seshatId: string;
};

/** One year per fixed window the span touches: the middle of the part of the window it covers. */
export function yearsFor(fromYear: number, toYear: number): number[] {
  const years: number[] = [];
  for (let year = fromYear; year <= toYear; year = periodOf(year).toYear + 1) {
    const window = periodOf(year);
    years.push(Math.round((Math.max(fromYear, window.fromYear) + Math.min(toYear, window.toYear)) / 2));
  }
  return years;
}

/** The slice of a polity holding territory in `year`, else the one whose range is nearest to it. */
function sliceAt(slices: CliopatriaFeature[], year: number): CliopatriaFeature {
  const distance = ({ properties: p }: CliopatriaFeature) => (year < p.FromYear ? p.FromYear - year : year > p.ToYear ? year - p.ToYear : 0);
  return slices.reduce((best, slice) => (distance(slice) < distance(best) ? slice : best));
}

/** Every polity split into the fixed windows its span touches, each with the territory it held then. */
export async function buildWindowJobs(): Promise<WindowJob[]> {
  const byName = new Map<string, CliopatriaFeature[]>();
  for (const feature of await loadCliopatria()) {
    byName.set(feature.properties.Name, [...(byName.get(feature.properties.Name) ?? []), feature]);
  }

  return Array.from(byName, ([name, slices]) => {
    const fromYear = Math.min(...slices.map((slice) => slice.properties.FromYear));
    const toYear = Math.max(...slices.map((slice) => slice.properties.ToYear));
    return yearsFor(fromYear, toYear).map((year) => {
      const slice = sliceAt(slices, year);
      const { Area, Wikidata, SeshatID } = slice.properties;
      return { name, year, window: periodOf(year), place: { ...centroidOf(slice), fromYear, toYear }, areaKm2: Area, wikidata: Wikidata, seshatId: SeshatID };
    });
  }).flat();
}
