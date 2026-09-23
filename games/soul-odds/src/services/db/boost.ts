import { and, eq } from 'drizzle-orm';
import { db } from '.';
import { type Boost, boostSchema, type NewBoost } from './Schema';
import { findUser, useTokens } from './user';

export type { Boost, NewBoost };

export async function createUserBoost(userAddress: string): Promise<void> {
  const boosts: NewBoost[] = [
    { type: 'paid', boostId: 1, level: 0, cost: 10000, maximumLevel: 10, userAddress },
    { type: 'paid', boostId: 2, level: 0, cost: 10000, maximumLevel: 5, userAddress },
    { type: 'paid-no-levels', boostId: 3, cost: 200000, userAddress },
    { type: 'paid-no-levels', boostId: 4, cost: 50000, userAddress },
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
