import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { userWorkouts } from './user-workout.schema';

export const workoutSchedules = sqliteTable(
  'workout_schedules',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    userWorkoutId: text('user_workout_id')
      .notNull()
      .references(() => userWorkouts.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('workout_schedules_user_id_idx').on(table.userId),
    unique('workout_schedules_user_workout_unique').on(table.userId, table.userWorkoutId),
  ]
);

export type WorkoutSchedule = typeof workoutSchedules.$inferSelect;
export type NewWorkoutSchedule = typeof workoutSchedules.$inferInsert;
