import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { db } from '@/services/db';
import { userSchema } from '@/services/db/Schema';
import { createUser } from '@/services/db/user';

interface SeedUser {
  address: string;
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

  for (const { address } of seedUsers) {
    await createUser(address);
  }

  console.log(`*** Seeded ${seedUsers.length} users.`);
}
seedDatabase()