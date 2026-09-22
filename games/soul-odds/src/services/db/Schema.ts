import type { InferSelectModel } from 'drizzle-orm';
import {
  integer,
  numeric,
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

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
// A user is identified only by their wallet address (lowercase 0x-prefixed
// hex, 42 chars) - there is no app-assigned id. `username` is optional and
// chosen after signup (a fresh user has none yet), `points` is the
// leaderboard score, `balance` is the spendable amount and `totalProfit` is
// the lifetime net win/loss (can be negative). `referredBy` is the address
// of whoever referred this user, set once at signup. `rank` is the highest
// coin-tier badge they've claimed (Plankton, Minnow, ...), not a leaderboard
// position - see `badgesLists` in Badges.tsx. `tasksCompleted` holds the ids
// of the `task` rows below that this user has finished.

export const userSchema = pgTable('user', {
  address: varchar('address', { length: 42 }).primaryKey(),
  username: varchar('username', { length: 255 }),
  referredBy: varchar('referred_by', { length: 42 }),
  rank: integer('rank').default(0).notNull(),
  points: integer('points').default(0).notNull(),
  balance: numeric('balance', { precision: 20, scale: 2, mode: 'number' }).default(0).notNull(),
  totalProfit: numeric('total_profit', { precision: 20, scale: 2, mode: 'number' })
    .default(0)
    .notNull(),
  tasksCompleted: integer('tasks_completed').array().notNull().default([]),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
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

export const boostTypeEnum = pgEnum('boost_type', ['paid', 'paid-no-levels']);

export const boostSchema = pgTable('boost', {
  id: serial('id').primaryKey(),
  type: boostTypeEnum('type').notNull(),
  // Catalog id (1-6 in the seed data), NOT the row id. Each user has one
  // row per boostId, so lookups must always filter on (userAddress, boostId)
  // together - boostId alone is not unique across users.
  boostId: integer('boost_id').notNull(),
  userAddress: varchar('user_address', { length: 42 })
    .notNull()
    .references(() => userSchema.address),
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

// ---------------------------------------------------------------------------
// Cliopatria places
// ---------------------------------------------------------------------------
// One row per Cliopatria polity (see `scripts/seed-cliopatria.ts` and the
// gitignored `cliopatria.geojson/` dataset it reads from): the polity's name,
// the year range it held that territory, and a representative point (its
// outer ring's centroid) instead of the full polygon - a random-year lookup
// only ever needs one point to place a soul, not the whole shape.

export const cliopatriaPlaceSchema = pgTable('cliopatria_place', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  fromYear: integer('from_year').notNull(),
  toYear: integer('to_year').notNull(),
  lat: numeric('lat', { precision: 9, scale: 6, mode: 'number' }).notNull(),
  lon: numeric('lon', { precision: 9, scale: 6, mode: 'number' }).notNull(),
  // Wikidata QID (e.g. "Q2345840"), when the source dataset has one - lets a correction script
  // cross-check/fix `fromYear`/`toYear` against Wikidata without re-parsing the raw geojson.
  wikidata: varchar('wikidata', { length: 32 }),
});

export type CliopatriaPlaceRow = InferSelectModel<typeof cliopatriaPlaceSchema>;
export type NewCliopatriaPlaceRow = typeof cliopatriaPlaceSchema.$inferInsert;