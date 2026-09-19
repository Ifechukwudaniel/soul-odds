import { eq, gte, sql } from 'drizzle-orm';
import { db } from '.';
import { type Energy, type SocialLinks, type User, userSchema } from './Schema';
import { createUserBoost } from './boost';

// Re-exported so `import { User } from "@/services/db/user"` (and the
// relative equivalent) keeps working the way it did when `User` was
// defined directly in this file, back before the Drizzle move to Schema.ts.
export type { User, Energy, SocialLinks };

export interface AllActiveUserCount {
  count: number;
}

export interface TotalTokenInCirclation {
  total: number;
}

export interface TotalTouchesByAllUser {
  touches: number;
}

export interface AllDailyUser {
  dailyUsers: number;
}

export async function login(id: string, connectionId: string): Promise<void> {
  await db
    .update(userSchema)
    .set({ online: true, lastOnline: new Date(), connectionId })
    .where(eq(userSchema.id, Number(id)));
}

export async function logout(id: string): Promise<void> {
  // NB: despite the param name (kept for a drop-in signature), the original
  // matched on connectionId here, not the user's id - preserved as-is.
  await db
    .update(userSchema)
    .set({ online: false, lastOnline: new Date(), connectionId: null })
    .where(eq(userSchema.connectionId, id));
}

export async function userClick(id: string): Promise<void> {
  const [user] = await db.select().from(userSchema).where(eq(userSchema.id, Number(id))).limit(1);

  if (!user) {
    throw new Error('User Does not exist');
  }

  await db
    .update(userSchema)
    .set({ touches: user.touches + 1, balance: user.balance + 1 })
    .where(eq(userSchema.id, user.id));
}

export async function getUserRefers(id: string): Promise<User[]> {
  const user = await findUser(id);
  if (!user) return [];
  return db.select().from(userSchema).where(eq(userSchema.referedBy, user.id));
}

export async function useTokens(id: string, amount: number): Promise<void> {
  const [user] = await db.select().from(userSchema).where(eq(userSchema.id, Number(id))).limit(1);

  if (!user) {
    throw new Error('User Does not exist');
  }

  if (user.balance < amount) {
    throw new Error('User Does not have enough tokens');
  }

  await db
    .update(userSchema)
    .set({ balance: user.balance - amount })
    .where(eq(userSchema.id, user.id));
}

export async function getAllTokensInCircluation(): Promise<TotalTokenInCirclation> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${userSchema.balance}), 0)` })
    .from(userSchema);
  return { total: Number(result?.total ?? 0) };
}

export async function getAllTouchesByAllUsers(): Promise<TotalTouchesByAllUser> {
  const [result] = await db
    .select({ total: sql<number>`coalesce(sum(${userSchema.touches}), 0)` })
    .from(userSchema);
  return { touches: Number(result?.total ?? 0) };
}

export async function getOnlineUserCount(): Promise<AllActiveUserCount> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSchema)
    .where(eq(userSchema.online, true));
  return { count: Number(result?.count ?? 0) };
}

export async function getDailyUsers(): Promise<AllDailyUser> {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSchema)
    .where(sql`${userSchema.lastOnline}::date = current_date`);
  return { dailyUsers: Number(result?.count ?? 0) };
}

export async function findAllUsers(): Promise<User[]> {
  return db.select().from(userSchema);
}

export async function findUser(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(userSchema).where(eq(userSchema.id, Number(id))).limit(1);
  return user;
}

export async function createUser(
  id: number,
  referedBy: number | undefined,
  username: string,
  first: string,
  last: string,
  lang: string,
): Promise<User> {
  const [created] = await db
    .insert(userSchema)
    .values({
      id,
      username,
      first,
      last,
      lang,
      referedBy,
      touches: 0,
      balance: 1000,
      online: false,
      rank: 0,
      energy: { maxEnergy: 1000, energyLeft: 500 },
      totalCoinsMined: 1000,
      totalRefered: 0,
      totalReferedCliamed: 0,
      taskesCompleted: [],
      lastExtraTap: null,
      lastRefillTap: null,
    })
    .returning();

  await createUserBoost(id);

  if (referedBy !== undefined) {
    const [referrer] = await db
      .select()
      .from(userSchema)
      .where(gte(userSchema.id, referedBy))
      .limit(1);

    if (referrer) {
      await db
        .update(userSchema)
        .set({ totalRefered: referrer.totalRefered + 1 })
        .where(eq(userSchema.id, referrer.id));
    }
  }

  return created!;
}

export async function updateUser(user: Partial<User> & { id: number }): Promise<void> {
  await db.update(userSchema).set(user).where(eq(userSchema.id, user.id));
}

export async function updateTaskes(userId: number, ids: number[]): Promise<void> {
  const uniqueIds = Array.from(new Set(ids));
  await db.update(userSchema).set({ taskesCompleted: uniqueIds }).where(eq(userSchema.id, userId));
}
