import fs from 'fs';
import path from 'path';
import type { SinNarratives } from '@/lib/mortal-odds/openrouter';
import { insertSinCatalogEntries } from '@/services/db/sin-catalog';

// Each row has 3 columns, so this stays well under Postgres' 65535 bound-parameter cap per statement.
const BATCH_SIZE = 500;

// Where the exported catalog lives, next to `cliopatria.geojson/` at the project root.
const DEFAULT_CATALOG_FILE = 'sin-catalog/sin-catalog.json';

type SeedEntry = { variants: SinNarratives[]; useCount: number };

/** Imports a `location -> { variants, useCount }` JSON file into `sin_catalog`, skipping locations already there. */
export async function seedSinCatalog(file: string) {
  const catalog = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) as Record<string, SeedEntry>;
  const rows = Object.entries(catalog).map(([location, entry]) => ({ location, ...entry }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    await insertSinCatalogEntries(rows.slice(i, i + BATCH_SIZE));
  }

  console.log(`*** Seeded ${rows.length} sin catalog entries.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const file = process.argv[2] ?? DEFAULT_CATALOG_FILE;
  seedSinCatalog(file).then(() => process.exit(0));
}
