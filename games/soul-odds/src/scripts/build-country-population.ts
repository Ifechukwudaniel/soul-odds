import fs from 'node:fs';
import path from 'node:path';
import { centroidOf, loadCliopatria } from '@/lib/mortal-odds/cliopatria';

/**
 * Builds the game's population figures from two files: Our World in Data's long-run population by
 * country (`population-long-run-with-projections/population-long-run-with-projections.csv`) and a
 * GeoJSON of today's country borders (`country-polygons/countries.geojson`, e.g. datasets/geo-countries).
 *
 *   tsx src/scripts/build-country-population.ts [countries.geojson] [population csv]
 *
 * 1. Merges them into one geo file, `country-polygons/countries-with-population.geojson`: each country
 *    polygon carries its population for every year in the CSV (joined on the alpha-3 code).
 * 2. Writes `config/mortal-odds/country-populations.json`: the same series without the shapes, plus each
 *    country's land area, which is what the game reads.
 * 3. Overlays every Cliopatria territory on the country map to get the land it covers in each modern
 *    country, and rewrites `cliopatria.geojson/cliopatria-population.json` with one row per Cliopatria
 *    territory (a polity over the years it held one border), whose population is those countries'
 *    densities times that land (see `lib/mortal-odds/density.ts`). `population-estimate.ts` redoes the
 *    sum for the exact year asked about, using the row whose border held then.
 *
 * The overlay lays a grid of 5 arc-minute cells (about 9 km) over both maps and counts the land per
 * cell, so a territory's land in a country is exact to about a cell. Cell areas come from the sphere.
 *
 * The first run keeps the file it replaces as cliopatria-population.researched.json.
 */

const COLS = 4320;
const ROWS = 2160;
const CELL = 360 / COLS;
const EARTH_RADIUS_KM = 6371.0088;
const DATA_DIR = path.join(process.cwd(), 'cliopatria.geojson');
const POLYGON_DIR = path.join(process.cwd(), 'country-polygons');
const FILE = path.join(DATA_DIR, 'cliopatria-population.json');
const RESEARCHED_FILE = path.join(DATA_DIR, 'cliopatria-population.researched.json');
const COUNTRIES_FILE = path.join(
  process.cwd(),
  'src',
  'config',
  'mortal-odds',
  'country-populations.json',
);
const MERGED_FILE = path.join(POLYGON_DIR, 'countries-with-population.geojson');
const DEFAULT_GEOJSON = path.join(POLYGON_DIR, 'countries.geojson');
const DEFAULT_CSV = path.join(
  process.cwd(),
  'population-long-run-with-projections',
  'population-long-run-with-projections.csv',
);
const COLUMNS = [
  'name',
  'fromYear',
  'toYear',
  'wikidata',
  'seshatId',
  'areaKm2',
  'population',
  'low',
  'high',
  'method',
  'countries',
] as const;
/** The spread around a territory's best estimate: the density model has no uncertainty of its own to report. */
const LOW = 0.7;
const HIGH = 1.4;

/** Polygons the file gives no alpha-3 code (or a different one from the CSV) mapped to the CSV's code; a polygon in neither place is left out. */
const CODE_BY_POLYGON_NAME: Record<string, string> = {
  France: 'FRA',
  Norway: 'NOR',
  Kosovo: 'OWID_KOS',
  'Northern Cyprus': 'CYP',
  'Cyprus No Mans Area': 'CYP',
  Somaliland: 'SOM',
  'Dhekelia Sovereign Base Area': 'OWID_AKD',
  'Akrotiri Sovereign Base Area': 'OWID_AKD',
};

type Polygon = number[][][];
type CountryFeature = {
  type: 'Feature';
  properties: { name: string; 'ISO3166-1-Alpha-3'?: string };
  geometry:
    | { type: 'Polygon'; coordinates: Polygon }
    | { type: 'MultiPolygon'; coordinates: Polygon[] };
};
type Row = {
  name: string;
  fromYear: number;
  toYear: number;
  wikidata: string;
  seshatId: string;
  areaKm2: number;
  population: number;
  low: number;
  high: number;
  method: string;
  countries: string;
};

/** Area in km² of one cell of each row of the grid: the sphere between two parallels, over the cell's width. */
const rowAreaKm2 = Array.from({ length: ROWS }, (_, row) => {
  const north = ((90 - row * CELL) * Math.PI) / 180;
  const south = ((90 - (row + 1) * CELL) * Math.PI) / 180;
  return EARTH_RADIUS_KM ** 2 * ((CELL * Math.PI) / 180) * (Math.sin(north) - Math.sin(south));
});

/** The CSV's country series: Population up to 2023 and the medium-variant projection after, by code and year. */
function readPopulations(file: string) {
  const [, ...lines] = fs.readFileSync(file, 'utf8').trim().split('\n');
  const byCode = new Map<string, { name: string; series: Map<number, number> }>();
  const years = new Set<number>();
  for (const line of lines) {
    const [entity = '', code = '', year = '', projected = '', population = ''] = line.split(',');
    const value =
      population !== '' ? Number(population) : projected !== '' ? Number(projected) : NaN;
    if (code === '' || Number.isNaN(value)) continue;
    years.add(Number(year));
    const country = byCode.get(code) ?? { name: entity, series: new Map() };
    country.series.set(Number(year), value);
    byCode.set(code, country);
  }
  return { years: [...years].sort((a, b) => a - b), byCode };
}

/**
 * A country's population at every year of the table. A few countries have figures for years the others
 * don't (1555, 1640, 1785, ...), so a year a country lacks is worked out between its neighbouring years,
 * geometrically like `lib/mortal-odds/density.ts` does, rather than left as zero, which would pull every
 * year around it towards nothing. Before its first year a country has no one; after its last it keeps the last.
 */
function filledSeries(known: Map<number, number>, years: number[]): number[] {
  const knownYears = [...known.keys()].sort((a, b) => a - b);
  return years.map((year) => {
    const exact = known.get(year);
    if (exact !== undefined) return Math.round(exact);
    const before = knownYears.filter((y) => y < year).at(-1);
    const after = knownYears.find((y) => y > year);
    if (before === undefined) return 0;
    if (after === undefined) return Math.round(known.get(before) ?? 0);
    const [v0, v1] = [known.get(before) ?? 0, known.get(after) ?? 0];
    const t = (year - before) / (after - before);
    return Math.round(v0 > 0 && v1 > 0 ? v0 * (v1 / v0) ** t : v0 + (v1 - v0) * t);
  });
}

type Ring = number[][];

/** A ring's vertices with longitudes made continuous across the antimeridian, so an edge never spans the whole map. */
function unwrap(ring: Ring): Ring {
  let offset = 0;
  return ring.map(([lon = 0, lat = 0], i) => {
    const prev = ring[i - 1]?.[0];
    if (prev !== undefined) {
      const jump = lon + offset - (prev + offset);
      if (jump > 180) offset -= 360;
      else if (jump < -180) offset += 360;
    }
    return [lon + offset, lat];
  });
}

/** Calls `visit` with the grid row and index of every cell whose centre falls inside the shape: scanline fill with even-odd holes. */
function forEachCell(polygons: Polygon[], visit: (row: number, cell: number) => void) {
  for (const polygon of polygons) {
    const rings = polygon.map(unwrap);
    const lats = rings.flatMap((ring) => ring.map((point) => point[1] ?? 0));
    const first = Math.max(0, Math.floor((90 - Math.max(...lats)) / CELL));
    const last = Math.min(ROWS - 1, Math.ceil((90 - Math.min(...lats)) / CELL));
    for (let row = first; row <= last; row++) {
      const y = 90 - (row + 0.5) * CELL;
      const crossings: number[] = [];
      for (const ring of rings) {
        for (let i = 1; i < ring.length; i++) {
          const [x1 = 0, y1 = 0] = ring[i - 1] ?? [];
          const [x2 = 0, y2 = 0] = ring[i] ?? [];
          if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y))
            crossings.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
        }
      }
      crossings.sort((a, b) => a - b);
      for (let pair = 0; pair + 1 < crossings.length; pair += 2) {
        const from = Math.ceil((crossings[pair]! + 180) / CELL - 0.5);
        const to = Math.floor((crossings[pair + 1]! + 180) / CELL - 0.5);
        for (let col = from; col <= to; col++)
          visit(row, row * COLS + (((col % COLS) + COLS) % COLS));
      }
    }
  }
}

const polygonsOf = (geometry: CountryFeature['geometry']): Polygon[] =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;

async function main() {
  const [geojsonFile = DEFAULT_GEOJSON, csv = DEFAULT_CSV] = process.argv.slice(2);
  const { years, byCode } = readPopulations(csv);
  const { features: polygons } = JSON.parse(fs.readFileSync(geojsonFile, 'utf8')) as {
    features: CountryFeature[];
  };

  const codeOf = (feature: CountryFeature) => {
    const alpha3 = feature.properties['ISO3166-1-Alpha-3'];
    const code =
      CODE_BY_POLYGON_NAME[feature.properties.name] ??
      (alpha3 && alpha3 !== '-99' ? alpha3 : undefined);
    return code !== undefined && byCode.has(code) ? code : undefined;
  };

  const codes = [...new Set(polygons.flatMap((feature) => codeOf(feature) ?? []))].sort((a, b) =>
    (byCode.get(a)?.name ?? '').localeCompare(byCode.get(b)?.name ?? ''),
  );
  const indexOfCode = new Map(codes.map((code, i) => [code, i]));

  // Paint each country's index onto the grid, counting its land as the cells' areas.
  const countryOfCell = new Int16Array(COLS * ROWS).fill(-1);
  const landKm2 = new Float64Array(codes.length);
  for (const feature of polygons) {
    const code = codeOf(feature);
    if (code === undefined) continue;
    const index = indexOfCode.get(code)!;
    forEachCell(polygonsOf(feature.geometry), (row, cell) => {
      if (countryOfCell[cell] === index) return;
      if (countryOfCell[cell]! >= 0) landKm2[countryOfCell[cell]!]! -= rowAreaKm2[row]!;
      countryOfCell[cell] = index;
      landKm2[index]! += rowAreaKm2[row]!;
    });
  }
  console.log(`${codes.length} countries joined to the CSV from ${polygons.length} polygons`);

  const series = (code: string) => filledSeries(byCode.get(code)?.series ?? new Map(), years);
  fs.writeFileSync(
    COUNTRIES_FILE,
    JSON.stringify({
      years,
      countries: codes.map((code, i) => ({
        name: byCode.get(code)!.name,
        code,
        landKm2: Math.round(landKm2[i]!),
        population: series(code),
      })),
    }),
  );
  console.log(`Wrote ${COUNTRIES_FILE}`);

  fs.writeFileSync(
    MERGED_FILE,
    JSON.stringify({
      type: 'FeatureCollection',
      years,
      features: polygons.flatMap((feature) => {
        const code = codeOf(feature);
        return code === undefined
          ? []
          : [
              {
                ...feature,
                properties: {
                  name: feature.properties.name,
                  code,
                  entity: byCode.get(code)!.name,
                  landKm2: Math.round(landKm2[indexOfCode.get(code)!]!),
                  population: series(code),
                },
              },
            ];
      }),
    }),
  );
  console.log(`Wrote ${MERGED_FILE}`);

  if (!fs.existsSync(RESEARCHED_FILE)) fs.copyFileSync(FILE, RESEARCHED_FILE);

  // Imported now, not at the top: it reads the file written above.
  const { populationFromCountries } = await import('@/lib/mortal-odds/density');
  const territories = await loadCliopatria();
  const rows = territories.map((territory, index): Row => {
    const { Name, FromYear, ToYear, Wikidata, SeshatID, Area } = territory.properties;
    const land = new Map<number, number>();
    forEachCell(polygonsOf(territory.geometry), (row, cell) => {
      const country = countryOfCell[cell]!;
      if (country >= 0) land.set(country, (land.get(country) ?? 0) + rowAreaKm2[row]!);
    });
    if (land.size === 0) {
      // Smaller than a single cell, or all sea: the country its centre lies in gets its whole area.
      const { lat, lon } = centroidOf(territory);
      const country =
        countryOfCell[
          Math.min(ROWS - 1, Math.max(0, Math.floor((90 - lat) / CELL))) * COLS +
            (Math.floor((lon + 180) / CELL) % COLS)
        ]!;
      if (country >= 0) land.set(country, Area);
    }
    const total = Math.round(
      populationFromCountries({
        year: (FromYear + ToYear) / 2,
        landByCountry: Object.fromEntries(land),
      }),
    );
    if ((index + 1) % 2000 === 0) console.log(`${index + 1}/${territories.length} territories`);
    return {
      name: Name,
      fromYear: FromYear,
      toYear: ToYear,
      wikidata: Wikidata,
      seshatId: SeshatID,
      areaKm2: Math.round(Area),
      population: total,
      low: Math.round(total * LOW),
      high: Math.round(total * HIGH),
      method: 'density',
      countries: [...land].map(([country, km2]) => `${country}:${Math.round(km2)}`).join(','),
    };
  });

  fs.writeFileSync(
    FILE,
    JSON.stringify({
      columns: COLUMNS,
      rows: rows.map((row) => COLUMNS.map((column) => row[column])),
    }),
  );
  console.log(`Wrote ${rows.length} territories to ${FILE}`);
}

main();
