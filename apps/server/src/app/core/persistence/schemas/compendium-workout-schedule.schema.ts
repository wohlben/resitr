import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkouts } from './compendium-workout.schema';

export const compendiumWorkoutSchedules = sqliteTable(
  'compendium_workout_schedules',
  {
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => compendiumWorkouts.templateId, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.workoutTemplateId, table.dayOfWeek] }),
  ]
);

export type CompendiumWorkoutSchedule = typeof compendiumWorkoutSchedules.$inferInsert;
