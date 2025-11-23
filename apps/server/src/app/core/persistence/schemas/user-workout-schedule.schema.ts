import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkouts } from './compendium-workout.schema';

export const userWorkoutSchedules = sqliteTable(
  'user_workout_schedules',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => compendiumWorkouts.templateId, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    order: integer('order').notNull().default(0), // Order for multiple workouts on same day
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('user_workout_schedules_user_id_idx').on(table.userId),
    index('user_workout_schedules_user_day_idx').on(table.userId, table.dayOfWeek),
    unique('user_workout_schedules_user_workout_day_unique').on(
      table.userId,
      table.workoutTemplateId,
      table.dayOfWeek
    ),
  ]
);

export type UserWorkoutSchedule = typeof userWorkoutSchedules.$inferSelect;
export type NewUserWorkoutSchedule = typeof userWorkoutSchedules.$inferInsert;
