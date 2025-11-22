import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { userWorkoutLogs } from './user-workout-log.schema';
import { WorkoutSectionType } from './compendium-workout-section.schema';

export const userWorkoutLogSections = sqliteTable('user_workout_log_sections', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    workoutLogId: text('workout_log_id')
        .notNull()
        .references(() => userWorkoutLogs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    orderIndex: integer('order_index').notNull(),
    type: text('type').$type<WorkoutSectionType>().notNull(),

    completedAt: integer('completed_at', { mode: 'timestamp' }),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type UserWorkoutLogSection = typeof userWorkoutLogSections.$inferInsert;
