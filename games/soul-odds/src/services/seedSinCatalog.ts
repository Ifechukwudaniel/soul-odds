import fs from 'fs';
import path from 'path';
import { periodOf } from '@/lib/mortal-odds/sin-variants';
import type { SinVariant } from '@/lib/mortal-odds/sin-variants';
import { findMidYearByPlaceName } from '@/services/db/cliopatria';
import { findAllSinCatalogRows, insertSinVariants } from '@/services/db/sin-catalog';
import type { NewSinCatalogRow } from '@/services/db/sin-catalog';

// Each row has 5 columns, so this stays well under Postgres' 65535 bound-parameter cap per statement.
const BATCH_SIZE = 500;

// Where the exported catalog lives, next to `cliopatria.geojson/` at the project root.
const DEFAULT_CATALOG_FILE = 'sin-catalog/sin-catalog.json';

type SeedEntry = { variants: SinVariant[] };

/**
 * `dev` fills in places the table has no rows for yet and skips the rest. `prod` also merges into
 * a live catalog: for a place already there it inserts only the variants (same place, period and
 * wording) it lacks, so what players have grown in production is never replaced.
 */
export type SeedMode = 'dev' | 'prod';

/** Stringifies with sorted keys, so a variant read back from jsonb (which reorders keys) compares equal to the file's. */
const canonical = (value: unknown) =>
  JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b)))
      : v,
  );

const keyOf = (row: NewSinCatalogRow) =>
  canonical([row.location, row.fromYear, row.toYear, row.narratives]);

/**
 * One row per variant. A variant without a period of its own is given the window around its
 * place's midpoint year (the year it was generated for); one whose place has no year is skipped,
 * since it can't be shown to fit any period.
 */
function toRows(
  catalog: Record<string, SeedEntry>,
  midYears: Map<string, number>,
): NewSinCatalogRow[] {
  return Object.entries(catalog).flatMap(([location, entry]) =>
    entry.variants.flatMap(({ fromYear, toYear, ...narratives }): NewSinCatalogRow[] => {
      const midYear = midYears.get(location);
      const period =
        fromYear !== undefined && toYear !== undefined
          ? { fromYear, toYear }
          : midYear === undefined
            ? null
            : periodOf(midYear);
      return period ? [{ location, ...period, narratives }] : [];
    }),
  );
}

/** Imports a `location -> { variants }` JSON file into `sin_variant`. */
export async function seedSinCatalog(file: string, mode: SeedMode = 'dev') {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) as Record<
    string,
    SeedEntry
  >;
  const rows = toRows(catalog, await findMidYearByPlaceName());

  const existing = await findAllSinCatalogRows();
  const seededLocations = new Set(existing.map((row) => row.location));
  const seededKeys = new Set(existing.map(keyOf));
  const missing = rows.filter((row) =>
    mode === 'prod' ? !seededKeys.has(keyOf(row)) : !seededLocations.has(row.location),
  );

  for (let i = 0; i < missing.length; i += BATCH_SIZE) {
    await insertSinVariants(missing.slice(i, i + BATCH_SIZE));
  }

  console.log(`*** Seeded ${missing.length} of ${rows.length} sin variants (${mode}).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const prod = args.includes('--prod') || process.env.NODE_ENV === 'production';
  const file = args.find((arg) => !arg.startsWith('--')) ?? DEFAULT_CATALOG_FILE;
  seedSinCatalog(file, prod ? 'prod' : 'dev').then(() => process.exit(0));
}
