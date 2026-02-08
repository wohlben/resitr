import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { workoutSchedules } from './workout-schedule.schema';

export type ScheduleCriteriaType = 'DAY_OF_WEEK';

export const workoutScheduleCriteria = sqliteTable(
  'workout_schedule_criteria',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => workoutSchedules.id, { onDelete: 'cascade' }),
    type: text('type').$type<ScheduleCriteriaType>().notNull(),
    order: integer('order').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('workout_schedule_criteria_schedule_id_idx').on(table.scheduleId),
    index('workout_schedule_criteria_type_idx').on(table.type),
  ]
);

export type WorkoutScheduleCriteria = typeof workoutScheduleCriteria.$inferSelect;
export type NewWorkoutScheduleCriteria = typeof workoutScheduleCriteria.$inferInsert;
