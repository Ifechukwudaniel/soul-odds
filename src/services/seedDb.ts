import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '@/services/db';
import { userSchema } from '@/services/db/Schema';
import { createUser } from '@/services/db/user';

interface SeedUser {
  id: number;
  username: string;
  first: string;
  last: string;
  lang: string;
  referedBy?: number;
}

export async function seedDatabase() {
  const rows = await db.select({ count: sql<number>`count(*)` }).from(userSchema);
  const count = Number(rows[0]?.count ?? 0);

  if (count > 0) {
    console.log('*** Database is not empty. Skipping seed import...');
    return;
  }

  const USER_SEED_DATA = path.join(process.cwd(), 'src/local_database/users.json');
  const seedUsers = JSON.parse(fs.readFileSync(USER_SEED_DATA, 'utf8')) as SeedUser[];

  // The original used `seedUsers.forEach(async (userData) => {...})`, which
  // fires every createUser call concurrently and doesn't wait for any of
  // them - seedDatabase() could resolve before a single user was actually
  // inserted. Sequential for-of + await fixes that; switch to
  // Promise.all(seedUsers.map(...)) instead if you want them created in
  // parallel and don't need referedBy lookups to see earlier-seeded users.
  for (const userData of seedUsers) {
    const { id, username, first, last, lang, referedBy } = userData;
    await createUser(id, referedBy, username, first, last, lang);
  }

  console.log(`*** Seeded ${seedUsers.length} users.`);
}