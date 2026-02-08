import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { workoutScheduleCriteria } from './workout-schedule-criteria.schema';

export const workoutScheduleCriteriaDayOfWeek = sqliteTable(
  'workout_schedule_criteria_day_of_week',
  {
    criteriaId: text('criteria_id')
      .notNull()
      .references(() => workoutScheduleCriteria.id, { onDelete: 'cascade' }),
    dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  },
  (table) => [
    primaryKey({ columns: [table.criteriaId, table.dayOfWeek] }),
    index('workout_schedule_criteria_dow_criteria_idx').on(table.criteriaId),
  ]
);

export type WorkoutScheduleCriteriaDayOfWeek = typeof workoutScheduleCriteriaDayOfWeek.$inferSelect;
export type NewWorkoutScheduleCriteriaDayOfWeek = typeof workoutScheduleCriteriaDayOfWeek.$inferInsert;
