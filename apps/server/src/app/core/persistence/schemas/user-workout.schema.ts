import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkouts } from './compendium-workout.schema';

export const userWorkouts = sqliteTable(
  'user_workouts',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => compendiumWorkouts.templateId, { onDelete: 'restrict' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('user_workouts_user_id_idx').on(table.userId),
    index('user_workouts_workout_template_id_idx').on(table.workoutTemplateId),
    unique('user_workouts_user_workout_unique').on(table.userId, table.workoutTemplateId),
  ]
);

export type UserWorkout = typeof userWorkouts.$inferSelect;
export type NewUserWorkout = typeof userWorkouts.$inferInsert;
