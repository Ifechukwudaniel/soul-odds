import { eq, sql } from 'drizzle-orm';
import { db } from '.';
import { type User, userSchema } from './Schema';
import { createUserBoost } from './boost';

export type { User };

export interface TotalTokenInCirclation {
  total: number;
}

// Addresses are stored lowercase so lookups don't depend on checksum casing.
function normalizeAddress(address: string) {
  return address.toLowerCase();
}

export async function findUser(address: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(userSchema)
    .where(eq(userSchema.address, normalizeAddress(address)))
    .limit(1);
  return user;
}

export async function findAllUsers(): Promise<User[]> {
  return db.select().from(userSchema);
}

export async function createUser(address: string): Promise<User> {
  const [created] = await db
    .insert(userSchema)
    .values({ address: normalizeAddress(address) })
    .returning();

  await createUserBoost(created!.address);

  return created!;
}

export async function updateUser(user: Partial<User> & { address: string }): Promise<void> {
  const { address, ...fields } = user;
  await db
    .update(userSchema)
    .set(fields)
    .where(eq(userSchema.address, normalizeAddress(address)));
}

export async function useTokens(address: string, amount: number): Promise<void> {
  const user = await findUser(address);

  if (!user) {
    throw new Error('User Does not exist');
  }

  if (user.balance < amount) {
    throw new Error('User Does not have enough tokens');
  }

  await db
    .update(userSchema)
    .set({ balance: user.balance - amount })
    .where(eq(userSchema.address, user.address));
}

export async function getAllTokensInCircluation(): Promise<TotalTokenInCirclation> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${userSchema.balance}), 0)` })
    .from(userSchema);
  return { total: Number(result?.total ?? 0) };
}
