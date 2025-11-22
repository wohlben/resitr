import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkouts } from './compendium-workout.schema';

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
  workoutTemplateId: text('workout_template_id')
    .notNull()
    .references(() => compendiumWorkouts.templateId, { onDelete: 'cascade' }),
  type: text('type').$type<WorkoutSectionType>().notNull(),
  name: text('name').notNull(),
  orderIndex: integer('order_index').notNull(),

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type CompendiumWorkoutSection = typeof compendiumWorkoutSections.$inferInsert;
