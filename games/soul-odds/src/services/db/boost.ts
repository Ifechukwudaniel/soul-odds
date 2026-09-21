import { and, eq } from 'drizzle-orm';
import { db } from '.';
import { type Boost, boostSchema, type NewBoost } from './Schema';
import { checkIfMoreThanADay, getPreviousDay } from '@/utils';
import { findUser, useTokens } from './user';

export type { Boost, NewBoost };

export async function createUserBoost(userAddress: string): Promise<void> {
  const boosts: NewBoost[] = [
    { type: 'free', boostId: 1, totalPerDay: 3, left: 3, lastUsed: getPreviousDay(), userAddress },
    { type: 'free', boostId: 2, totalPerDay: 3, left: 3, lastUsed: getPreviousDay(), userAddress },
    { type: 'paid', boostId: 3, level: 0, cost: 10000, maximumLevel: 10, userAddress },
    { type: 'paid', boostId: 4, level: 0, cost: 10000, maximumLevel: 10, userAddress },
    { type: 'paid', boostId: 5, level: 0, cost: 10000, maximumLevel: 5, userAddress },
    { type: 'paid-no-levels', boostId: 6, cost: 200000, userAddress },
  ];

  await db.insert(boostSchema).values(boosts);
}

async function findBoost(userAddress: string, boostId: number) {
  const [boostRow] = await db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.boostId, boostId)))
    .limit(1);

  return boostRow;
}

export async function useFreeBoost(userAddress: string, boostId: number): Promise<void> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userAddress, boostId);
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

export async function usePaidBoost(userAddress: string, boostId: number): Promise<void> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userAddress, boostId);
  if (!boostRow) {
    throw new Error('Paid boost not found for the user');
  }

  if (boostRow.level === null) {
    throw new Error('Paid boost level not specified');
  }

  if (boostRow.cost && boostRow.maximumLevel && boostRow.level < boostRow.maximumLevel) {
    await useTokens(userAddress, boostRow.cost);
    await db
      .update(boostSchema)
      .set({ level: boostRow.level + 1, cost: boostRow.cost * 2 })
      .where(eq(boostSchema.id, boostRow.id));
  }
}

export async function usePaidNoLevelBoost(userAddress: string, boostId: number): Promise<void> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boostRow = await findBoost(userAddress, boostId);
  if (!boostRow) {
    throw new Error('Paid boost not found for the user');
  }

  if (boostRow.cost) {
    await useTokens(userAddress, boostRow.cost);
    await db
      .update(boostSchema)
      .set({ cost: boostRow.cost * 2 })
      .where(eq(boostSchema.id, boostRow.id));
  }
}

export async function getAllUserFreeBoosts(userAddress: string): Promise<Boost[]> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const boosts = await db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.type, 'free')));

  await Promise.all(
    boosts.map((boost) =>
      boost.lastUsed && checkIfMoreThanADay(boost.lastUsed)
        ? updateFreeBoostsCount(userAddress, boost.boostId, boost)
        : undefined
    )
  );

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.type, 'free')));
}

export async function getAllUserPaidBoosts(userAddress: string): Promise<Boost[]> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.type, 'paid')));
}

export async function getAllUserPaidNoLevelsBoosts(userAddress: string): Promise<Boost[]> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  return db
    .select()
    .from(boostSchema)
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.type, 'paid-no-levels')));
}

export async function updateFreeBoostsCount(userAddress: string, boostId: number, boost: Boost): Promise<void> {
  const user = await findUser(userAddress);
  if (!user) {
    throw new Error('Paid boost not found for the user');
  }

  const { id, createdAt, ...rest } = boost;

  await db
    .update(boostSchema)
    .set({ ...rest, left: 3 })
    .where(and(eq(boostSchema.userAddress, userAddress), eq(boostSchema.boostId, boostId)));
}

export async function updateFreeUserBoost(userAddress: string, boosts: Partial<Boost>[]): Promise<void> {
  const user = await findUser(userAddress);
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

export async function updatePaidUserBoost(userAddress: string, boosts: Partial<Boost>[]): Promise<void> {
  const user = await findUser(userAddress);
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
