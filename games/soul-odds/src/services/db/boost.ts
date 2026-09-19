import { and, eq } from 'drizzle-orm';
import { db } from '.';
import { type Boost, boostSchema, type NewBoost } from './Schema';
import { checkIfMoreThanADay, getPreviousDay } from '@/utils';
import { findUser, useTokens } from './user';

export type { Boost, NewBoost };

export async function createUserBoost(userId: number): Promise<void> {
  const boosts: NewBoost[] = [
    { type: 'free', boostId: 1, totalPerDay: 3, left: 3, lastUsed: getPreviousDay(), userId },
    { type: 'free', boostId: 2, totalPerDay: 3, left: 3, lastUsed: getPreviousDay(), userId },
    { type: 'paid', boostId: 3, level: 0, cost: 10000, maximumLevel: 10, userId },
    { type: 'paid', boostId: 4, level: 0, cost: 10000, maximumLevel: 10, userId },
    { type: 'paid', boostId: 5, level: 0, cost: 10000, maximumLevel: 5, userId },
    { type: 'paid-no-levels', boostId: 6, cost: 200000, userId },
  ];

  await db.insert(boostSchema).values(boosts);
}

async function findBoost(userId: number, boostId: number) {
  const [boostRow] = await db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.boostId, boostId)))
    .limit(1);

  return boostRow;
}

export async function useFreeBoost(userId: number, boostId: number): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userId, boostId);
  if (!boostRow) {
    throw new Error('Free boost not found for the user');
  }

  if (boostRow.totalPerDay === 0) {
    throw new Error('No available boosts remaining for the day');
  }

  if (boostRow.totalPerDay) {
    const updatedTotalPerDay = boostRow.totalPerDay - 1 || 0;
    await db
      .update(boostSchema)
      .set({ totalPerDay: updatedTotalPerDay, lastUsed: new Date() })
      .where(eq(boostSchema.id, boostRow.id));
  }
}

export async function usePaidBoost(userId: number, boostId: number): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userId, boostId);
  if (!boostRow) {
    throw new Error('Paid boost not found for the user');
  }

  if (boostRow.level === null) {
    throw new Error('Paid boost level not specified');
  }

  if (boostRow.cost && boostRow.maximumLevel && boostRow.level < boostRow.maximumLevel) {
    await useTokens(userId.toString(), boostRow.cost);
    await db
      .update(boostSchema)
      .set({ level: boostRow.level + 1, cost: boostRow.cost * 2 })
      .where(eq(boostSchema.id, boostRow.id));
  }
}

export async function usePaidNoLevelBoost(userId: number, boostId: number): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userId, boostId);
  if (!boostRow) {
    throw new Error('Paid boost not found for the user');
  }

  if (boostRow.cost) {
    await useTokens(userId.toString(), boostRow.cost);
    await db
      .update(boostSchema)
      .set({ cost: boostRow.cost * 2 })
      .where(eq(boostSchema.id, boostRow.id));
  }
}

export async function getAllUserFreeBoosts(userId: number): Promise<Boost[]> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boosts = await db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.type, 'free')));

  await Promise.all(
    boosts.map((boost) =>
      boost.lastUsed && checkIfMoreThanADay(boost.lastUsed)
        ? updateFreeBoostsCount(userId, boost.boostId, boost)
        : undefined
    )
  );

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.type, 'free')));
}

export async function getAllUserPaidBoosts(userId: number): Promise<Boost[]> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.type, 'paid')));
}

export async function getAllUserPaidNoLevelsBoosts(userId: number): Promise<Boost[]> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.type, 'paid-no-levels')));
}

export async function updateFreeBoostsCount(userId: number, boostId: number, boost: Boost): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const { id, createdAt, ...rest } = boost;

  await db
    .update(boostSchema)
    .set({ ...rest, left: 3 })
    .where(and(eq(boostSchema.userId, userId), eq(boostSchema.boostId, boostId)));
}

export async function updateFreeUserBoost(userId: number, boosts: Partial<Boost>[]): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  await Promise.all(
    boosts.map(({ id, ...rest }) => {
      if (id === undefined) return undefined;
      return db.update(boostSchema).set(rest).where(eq(boostSchema.id, id));
    })
  );
}

export async function updatePaidUserBoost(userId: number, boosts: Partial<Boost>[]): Promise<void> {
  const user = await findUser(userId.toString());
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  await Promise.all(
    boosts.map(({ id, ...rest }) => {
      if (id === undefined) return undefined;
      return db.update(boostSchema).set(rest).where(eq(boostSchema.id, id));
    })
  );
}
