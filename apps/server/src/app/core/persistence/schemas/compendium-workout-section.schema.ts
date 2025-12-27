import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export enum WorkoutSectionType {
  WARMUP = 'warmup',
  STRETCHING = 'stretching',
  STRENGTH = 'strength',
  COOLDOWN = 'cooldown',
}

export const compendiumWorkoutSections = sqliteTable('compendium_workout_sections', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text('type').$type<WorkoutSectionType>().notNull(),
  name: text('name').notNull(),
  workoutSectionItemIds: text('workout_section_item_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),
  forkedFrom: text('forked_from'),  // References the old section ID this was derived from

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export type CompendiumWorkoutSection = typeof compendiumWorkoutSections.$inferInsert;
