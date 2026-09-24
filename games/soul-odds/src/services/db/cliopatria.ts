import { and, eq, gte, ilike, isNotNull, lte, sql } from 'drizzle-orm';
import { db } from '.';
import {
  type CliopatriaPlaceRow,
  cliopatriaPlaceSchema,
  type NewCliopatriaPlaceRow,
} from './Schema';

export type { CliopatriaPlaceRow, NewCliopatriaPlaceRow };

/** Random-picks a Cliopatria polity whose date range covers `year`, or `undefined` if none does. */
export async function pickCliopatriaPlace(year: number): Promise<CliopatriaPlaceRow | undefined> {
  const [place] = await db
    .select()
    .from(cliopatriaPlaceSchema)
    .where(and(lte(cliopatriaPlaceSchema.fromYear, year), gte(cliopatriaPlaceSchema.toYear, year)))
    .orderBy(sql`random()`)
    .limit(1);
  return place;
}

/** The polity alive in `year` whose representative point is nearest (lat, lon), or `undefined` if none was alive. */
export async function findNearestCliopatriaPlace(options: {
  lat: number;
  lon: number;
  year: number;
}): Promise<CliopatriaPlaceRow | undefined> {
  const { lat, lon, year } = options;
  const [place] = await db
    .select()
    .from(cliopatriaPlaceSchema)
    .where(and(lte(cliopatriaPlaceSchema.fromYear, year), gte(cliopatriaPlaceSchema.toYear, year)))
    // ✦ Squared distance with longitude scaled by latitude: only the order matters, not the unit.
    .orderBy(
      sql`power(${cliopatriaPlaceSchema.lat} - ${lat}, 2) + power(cos(radians(${lat})) * (${cliopatriaPlaceSchema.lon} - ${lon}), 2)`,
    )
    .limit(1);
  return place;
}

/** Every date-sliced row for a polity name (case-insensitive) — a polity can have several, one per era slice. */
export async function findCliopatriaPlacesByName(name: string): Promise<CliopatriaPlaceRow[]> {
  return db.select().from(cliopatriaPlaceSchema).where(ilike(cliopatriaPlaceSchema.name, name));
}

/** Overwrites one row's date range - used by the Wikidata correction script, never by request-time code. */
export async function updateCliopatriaPlaceYears(
  id: number,
  fromYear: number,
  toYear: number,
): Promise<void> {
  await db
    .update(cliopatriaPlaceSchema)
    .set({ fromYear, toYear })
    .where(eq(cliopatriaPlaceSchema.id, id));
}

/** Every row that carries a Wikidata id - the batch correction script's input set. */
export async function findAllCliopatriaPlacesWithWikidata(): Promise<CliopatriaPlaceRow[]> {
  return db.select().from(cliopatriaPlaceSchema).where(isNotNull(cliopatriaPlaceSchema.wikidata));
}

export async function countCliopatriaPlaces(): Promise<number> {
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(cliopatriaPlaceSchema);
  return Number(result?.count ?? 0);
}

export async function insertCliopatriaPlaces(rows: NewCliopatriaPlaceRow[]): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(cliopatriaPlaceSchema).values(rows);
}

/** One representative year per distinct place name: the midpoint of its widest attested span. */
export async function findMidYearByPlaceName(): Promise<Map<string, number>> {
  const rows = await db
    .select({
      name: cliopatriaPlaceSchema.name,
      fromYear: cliopatriaPlaceSchema.fromYear,
      toYear: cliopatriaPlaceSchema.toYear,
    })
    .from(cliopatriaPlaceSchema);

  const widest = new Map<string, { fromYear: number; toYear: number }>();
  for (const row of rows) {
    const existing = widest.get(row.name);
    if (!existing || row.toYear - row.fromYear > existing.toYear - existing.fromYear) {
      widest.set(row.name, { fromYear: row.fromYear, toYear: row.toYear });
    }
  }
  return new Map(
    Array.from(widest, ([name, span]) => [name, Math.round((span.fromYear + span.toYear) / 2)]),
  );
}
