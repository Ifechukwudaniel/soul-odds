import type { InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

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
  socialClaimed: boolean('social_claimed').default(false).notNull(),
  freeRedraws: integer('free_redraws').default(0).notNull(),
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