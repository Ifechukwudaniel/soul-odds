import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
// `energy` and `social` were plain nested objects in the Typesaurus User
// interface; there's no reason to break them into columns, so they're kept
// as jsonb here. `id` is NOT auto-generated - the app assigns it externally
// (e.g. a Telegram user id), exactly like the original Typesaurus doc's
// custom `id` field, so it's a plain integer primary key rather than serial.

export type Energy = {
  maxEnergy: number;
  energyLeft: number;
};

export type SocialLinks = {
  twitter: string;
  discord: string;
};

export const userSchema = pgTable('user', {
  id: integer('id').primaryKey(),
  creationTimestamp: timestamp('creation_timestamp', { mode: 'date' }).defaultNow().notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  rank: integer('rank').default(0).notNull(),
  balance: integer('balance').default(0).notNull(),
  touches: integer('touches').default(0).notNull(),
  wallet: varchar('wallet', { length: 255 }),
  social: jsonb('social').$type<SocialLinks>(),
  online: boolean('online').default(false).notNull(),
  lastOnline: timestamp('last_online', { mode: 'date' }).defaultNow().notNull(),
  lang: varchar('lang', { length: 16 }).notNull(),
  first: varchar('first', { length: 255 }).notNull(),
  last: varchar('last', { length: 255 }).notNull(),
  referedBy: integer('refered_by'),
  energy: jsonb('energy').$type<Energy>().notNull(),
  connectionId: varchar('connection_id', { length: 255 }),
  totalCoinsMined: integer('total_coins_mined').default(0).notNull(),
  totalRefered: integer('total_refered').default(0).notNull(),
  totalReferedCliamed: integer('total_refered_claimed').default(0).notNull(),
  taskesCompleted: integer('taskes_completed').array().notNull().default([]),
  lastExtraTap: timestamp('last_extra_tap', { mode: 'date' }),
  lastRefillTap: timestamp('last_refill_tap', { mode: 'date' }),
});

export type User = InferSelectModel<typeof userSchema>;
export type NewUser = typeof userSchema.$inferInsert;

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------
// The original hand-rolled `id` as `(await db.tasks.all()).length + 1`,
// which races under concurrent creates. `serial` replaces that with a
// real auto-incrementing primary key.

export const taskSchema = pgTable('task', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  link: varchar('link', { length: 2048 }).notNull(),
  reward: integer('reward').notNull(),
});

export type Task = InferSelectModel<typeof taskSchema>;
export type NewTask = typeof taskSchema.$inferInsert;

// ---------------------------------------------------------------------------
// Boosts
// ---------------------------------------------------------------------------

export const boostTypeEnum = pgEnum('boost_type', ['free', 'paid', 'paid-no-levels']);

export const boostSchema = pgTable('boost', {
  id: serial('id').primaryKey(),
  type: boostTypeEnum('type').notNull(),
  // Catalog id (1-6 in the seed data), NOT the row id. Each user has one
  // row per boostId, so lookups must always filter on (userId, boostId)
  // together - boostId alone is not unique across users.
  boostId: integer('boost_id').notNull(),
  userId: integer('user_id').notNull().references(() => userSchema.id),
  totalPerDay: integer('total_per_day'),
  left: integer('left'),
  lastUsed: timestamp('last_used', { mode: 'date' }),
  level: integer('level'),
  maximumLevel: integer('maximum_level'),
  cost: integer('cost'),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export type Boost = InferSelectModel<typeof boostSchema>;
export type NewBoost = typeof boostSchema.$inferInsert;