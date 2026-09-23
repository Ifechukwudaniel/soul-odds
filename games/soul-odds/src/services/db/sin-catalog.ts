import { and, eq, gte, lte, sql } from 'drizzle-orm';
import { db } from '.';
import { type NewSinCatalogRow, type SinCatalogRow, sinCatalogSchema } from './Schema';

export type { NewSinCatalogRow, SinCatalogRow };

/** The rows written for `location` whose period covers `year`. */
export async function findSinVariantsCovering(location: string, year: number): Promise<SinCatalogRow[]> {
  return db
    .select()
    .from(sinCatalogSchema)
    .where(and(eq(sinCatalogSchema.location, location), lte(sinCatalogSchema.fromYear, year), gte(sinCatalogSchema.toYear, year)));
}

/** Every row - lets a seed see which variants a live catalog already has. */
export async function findAllSinCatalogRows(): Promise<SinCatalogRow[]> {
  return db.select().from(sinCatalogSchema);
}

export async function insertSinVariant(row: NewSinCatalogRow): Promise<void> {
  await db.insert(sinCatalogSchema).values(row);
}

export async function insertSinVariants(rows: NewSinCatalogRow[]): Promise<void> {
  if (rows.length === 0) return;
  await db.insert(sinCatalogSchema).values(rows);
}

/** Atomically bumps a row's use count and returns the new value, or `undefined` if the row is gone. */
export async function incrementSinVariantUseCount(id: number): Promise<number | undefined> {
  const [row] = await db
    .update(sinCatalogSchema)
    .set({ useCount: sql`${sinCatalogSchema.useCount} + 1` })
    .where(eq(sinCatalogSchema.id, id))
    .returning({ useCount: sinCatalogSchema.useCount });
  return row?.useCount;
}
