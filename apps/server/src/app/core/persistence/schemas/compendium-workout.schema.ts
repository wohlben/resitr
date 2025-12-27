import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const compendiumWorkouts = sqliteTable('compendium_workouts', {
  templateId: text('template_id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  sectionIds: text('section_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  version: integer('version').notNull(),
});

export type CompendiumWorkout = typeof compendiumWorkouts.$inferInsert;
