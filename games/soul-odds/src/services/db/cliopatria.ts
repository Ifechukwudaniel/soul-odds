import { and, eq, gte, ilike, isNotNull, lte, sql } from 'drizzle-orm';
import { db } from '.';
import { type CliopatriaPlaceRow, cliopatriaPlaceSchema, type NewCliopatriaPlaceRow } from './Schema';

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

/** Every date-sliced row for a polity name (case-insensitive) — a polity can have several, one per era slice. */
export async function findCliopatriaPlacesByName(name: string): Promise<CliopatriaPlaceRow[]> {
  return db.select().from(cliopatriaPlaceSchema).where(ilike(cliopatriaPlaceSchema.name, name));
}

/** Overwrites one row's date range - used by the Wikidata correction script, never by request-time code. */
export async function updateCliopatriaPlaceYears(id: number, fromYear: number, toYear: number): Promise<void> {
  await db.update(cliopatriaPlaceSchema).set({ fromYear, toYear }).where(eq(cliopatriaPlaceSchema.id, id));
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
