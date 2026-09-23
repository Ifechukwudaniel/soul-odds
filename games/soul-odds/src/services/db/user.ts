import { and, desc, eq, gt, sql } from 'drizzle-orm';
import { db } from '.';
import { type User, userSchema } from './Schema';

export type { User };

export interface TotalTokenInCirculation {
  total: number;
}

export type LeaderboardSort = 'points' | 'balance';

const DEFAULT_LEADERBOARD_LIMIT = 100;

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

export async function createUser(address: string, referredBy?: string, balance?: number): Promise<User> {
  const [created] = await db
    .insert(userSchema)
    .values({
      address: normalizeAddress(address),
      referredBy: referredBy ? normalizeAddress(referredBy) : undefined,
      ...(balance !== undefined && { balance }),
    })
    .returning();

  return created!;
}

export async function getUserRefers(address: string): Promise<User[]> {
  return db.select().from(userSchema).where(eq(userSchema.referredBy, normalizeAddress(address)));
}

export async function updateTasks(address: string, ids: number[]): Promise<void> {
  const uniqueIds = Array.from(new Set(ids));
  await db
    .update(userSchema)
    .set({ tasksCompleted: uniqueIds })
    .where(eq(userSchema.address, normalizeAddress(address)));
}

/**
 * Grants the social quest's one free redraw, once per user, and only when every required task is done.
 * @param address The claiming user's address.
 * @param requiredTaskIds The task ids that must all be in the user's completed list.
 * @returns The updated user, or undefined when the user is ineligible or already claimed.
 */
export async function claimSocialReward(address: string, requiredTaskIds: number[]): Promise<User | undefined> {
  const required = sql.join(
    requiredTaskIds.map((id) => sql`${id}`),
    sql`, `,
  );
  const [user] = await db
    .update(userSchema)
    .set({ socialClaimed: true, freeRedraws: sql`${userSchema.freeRedraws} + 1` })
    .where(
      and(
        eq(userSchema.address, normalizeAddress(address)),
        eq(userSchema.socialClaimed, false),
        sql`${userSchema.tasksCompleted} @> ARRAY[${required}]::int[]`,
      ),
    )
    .returning();
  return user;
}

/** Spends one free redraw atomically. Returns the remaining count, or undefined when the user had none. */
export async function consumeFreeRedraw(address: string): Promise<number | undefined> {
  const [row] = await db
    .update(userSchema)
    .set({ freeRedraws: sql`${userSchema.freeRedraws} - 1` })
    .where(and(eq(userSchema.address, normalizeAddress(address)), gt(userSchema.freeRedraws, 0)))
    .returning({ freeRedraws: userSchema.freeRedraws });
  return row?.freeRedraws;
}

export async function updateUser(user: Partial<User> & { address: string }): Promise<void> {
  const { address, ...fields } = user;
  await db
    .update(userSchema)
    .set(fields)
    .where(eq(userSchema.address, normalizeAddress(address)));
}

/** Adds to (never replaces) a user's leaderboard score — an atomic increment, so concurrent rounds can't clobber each other. */
export async function addPoints(address: string, delta: number): Promise<void> {
  await db
    .update(userSchema)
    .set({ points: sql`${userSchema.points} + ${Math.round(delta)}` })
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

/**
 * Fetches the top users ranked by points or balance, highest first.
 * @param sortBy Which column to rank by.
 * @param limit The maximum number of users to return.
 * @param address When given, guarantees this user is included even if their
 * rank falls outside `limit` - inserted at the position their own score
 * would place them, not tacked onto the end.
 * @returns The ranked users.
 */
export async function getLeaderboard(
  sortBy: LeaderboardSort = 'points',
  limit: number = DEFAULT_LEADERBOARD_LIMIT,
  address?: string,
): Promise<User[]> {
  const key = sortBy === 'balance' ? 'balance' : 'points';
  const column = userSchema[key];
  const users = await db.select().from(userSchema).orderBy(desc(column)).limit(limit);

  if (!address) {
    return users;
  }

  const normalized = normalizeAddress(address);
  if (users.some((user) => user.address === normalized)) {
    return users;
  }

  const currentUser = await findUser(normalized);
  if (!currentUser) {
    return users;
  }

  const insertAt = users.findIndex((user) => user[key] < currentUser[key]);
  if (insertAt === -1) {
    return [...users, currentUser];
  }
  return [...users.slice(0, insertAt), currentUser, ...users.slice(insertAt)];
}

export async function getAllTokensInCirculation(): Promise<TotalTokenInCirculation> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${userSchema.balance}), 0)` })
    .from(userSchema);
  return { total: Number(result?.total ?? 0) };
}
