import { loadCliopatria, toCliopatriaPlace } from '@/lib/mortal-odds/cliopatria';
import { countCliopatriaPlaces, insertCliopatriaPlaces } from '@/services/db/cliopatria';
import type { NewCliopatriaPlaceRow } from '@/services/db/Schema';

// Postgres caps a single statement at 65535 bound parameters; cliopatriaPlaceSchema has 5 insertable
// columns, so this stays comfortably under that per batch (2000 * 5 = 10000).
const BATCH_SIZE = 2000;

export async function seedCliopatria() {
  const count = await countCliopatriaPlaces();
  if (count > 0) {
    console.log('*** cliopatria_place is not empty. Skipping seed import...');
    return;
  }

  let features: Awaited<ReturnType<typeof loadCliopatria>>;
  try {
    features = await loadCliopatria();
  } catch {
    console.log('*** cliopatria.geojson not found locally. Skipping seed import...');
    return;
  }

  const places: NewCliopatriaPlaceRow[] = features.map(toCliopatriaPlace);

  for (let i = 0; i < places.length; i += BATCH_SIZE) {
    await insertCliopatriaPlaces(places.slice(i, i + BATCH_SIZE));
  }

  console.log(`*** Seeded ${places.length} Cliopatria places.`);
}
seedCliopatria();
