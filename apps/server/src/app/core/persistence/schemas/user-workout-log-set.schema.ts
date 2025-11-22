import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { userWorkoutLogSectionItems } from './user-workout-log-section-item.schema';

export const userWorkoutLogSets = sqliteTable('user_workout_log_sets', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    itemId: text('item_id')
        .notNull()
        .references(() => userWorkoutLogSectionItems.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(),

    targetReps: integer('target_reps'),
    achievedReps: integer('achieved_reps'),

    targetWeight: real('target_weight'),
    achievedWeight: real('achieved_weight'),

    targetTime: integer('target_time'), // seconds
    achievedTime: integer('achieved_time'), // seconds

    targetDistance: real('target_distance'),
    achievedDistance: real('achieved_distance'),

    completedAt: integer('completed_at', { mode: 'timestamp' }),
    skipped: integer('skipped', { mode: 'boolean' }).default(false),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type UserWorkoutLogSet = typeof userWorkoutLogSets.$inferInsert;
