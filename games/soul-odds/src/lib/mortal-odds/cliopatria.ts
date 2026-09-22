import { readFile } from "node:fs/promises";
import path from "node:path";

/** One polity's territory over the date range it held that shape (see cliopatria.geojson/README for the source dataset). */
export type CliopatriaFeature = {
  type: "Feature";
  properties: {
    Name: string;
    FromYear: number;
    ToYear: number;
    Area: number;
    Type: string;
    Wikipedia: string;
    Wikidata: string;
    SeshatID: string;
    Components: string;
    MemberOf: string;
  };
  geometry:
    | { type: "Polygon"; coordinates: number[][][] }
    | { type: "MultiPolygon"; coordinates: number[][][][] };
};

const CLIOPATRIA_PATH = path.join(process.cwd(), "cliopatria.geojson", "cliopatria_polities_only.geojson");

let cached: Promise<CliopatriaFeature[]> | null = null;

/**
 * Reads and parses the Cliopatria polities dataset (~150MB, ~15k records) once per process,
 * caching the parsed features so every later call is free. The first call pays the full
 * read+parse cost, so callers that only need this occasionally should call it lazily.
 */
export function loadCliopatria(): Promise<CliopatriaFeature[]> {
  if (!cached) {
    cached = readFile(CLIOPATRIA_PATH, "utf8").then((raw) => {
      const parsed = JSON.parse(raw) as { features: CliopatriaFeature[] };
      return parsed.features;
    });
  }
  return cached;
}

/** The outer ring to represent a feature's territory by: its one ring, or its largest sub-polygon's outer ring. */
function outerRing(geometry: CliopatriaFeature["geometry"]): number[][] {
  if (geometry.type === "Polygon") return geometry.coordinates[0] ?? [];
  return geometry.coordinates.reduce<number[][]>(
    (largest, polygon) => ((polygon[0]?.length ?? 0) > largest.length ? (polygon[0] ?? []) : largest),
    [],
  );
}

/** A representative point for a feature: the plain average of its outer ring's vertices. */
function centroidOf(feature: CliopatriaFeature): { lat: number; lon: number } {
  const ring = outerRing(feature.geometry);
  const sum = ring.reduce((acc, [lon, lat]) => ({ lon: acc.lon + (lon ?? 0), lat: acc.lat + (lat ?? 0) }), {
    lon: 0,
    lat: 0,
  });
  return { lon: sum.lon / ring.length, lat: sum.lat / ring.length };
}

export type CliopatriaPlace = {
  name: string;
  lat: number;
  lon: number;
  fromYear: number;
  toYear: number;
  wikidata: string | null;
};

/**
 * Reduces a raw feature to what `cliopatria_place` stores: its name, date range, a representative
 * point instead of the full polygon, and its Wikidata id. Picking is a SQL query against that
 * table (see `services/db/cliopatria.ts`) — this is only used to seed it, not at request time.
 */
export function toCliopatriaPlace(feature: CliopatriaFeature): CliopatriaPlace {
  const { lat, lon } = centroidOf(feature);
  return {
    name: feature.properties.Name,
    lat,
    lon,
    fromYear: feature.properties.FromYear,
    toYear: feature.properties.ToYear,
    wikidata: feature.properties.Wikidata || null,
  };
}
