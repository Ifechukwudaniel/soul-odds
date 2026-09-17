import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const pool = new Pool({ connectionString: 'postgres://postgres:postgres@127.0.0.1:5432/postgres' });
pool.on('error', (e) => console.log('POOL ERROR EVENT:', e.message));
const db = drizzle(pool);

console.log('starting migrate...');
const timeoutMs = 15000;
let settled = false;
const timer = setTimeout(async () => {
  if (settled) return;
  console.log(`TIMED OUT after ${timeoutMs}ms — migrate() never settled`);
  await pool.end().catch(() => {});
  process.exit(2);
}, timeoutMs);

try {
  await migrate(db, { migrationsFolder: './migrations' });
  settled = true;
  clearTimeout(timer);
  console.log('migrate() resolved OK');
  await pool.end().catch(() => {});
  process.exit(0);
} catch (e) {
  settled = true;
  clearTimeout(timer);
  console.log('migrate() REJECTED:', e && e.message);
  const cause = e && e.cause;
  if (cause) {
    console.log('CAUSE message:', cause.message);
    console.log('CAUSE full:', JSON.stringify(cause, Object.getOwnPropertyNames(cause), 2));
  }
  await pool.end().catch(() => {});
  process.exit(1);
}
