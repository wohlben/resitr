import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkouts } from './compendium-workout.schema';

export const userWorkoutLogs = sqliteTable('user_workout_logs', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    originalWorkoutId: text('original_workout_id').references(() => compendiumWorkouts.templateId, { onDelete: 'set null' }),
    name: text('name').notNull(),
    sectionIds: text('section_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),

    startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
    completedAt: integer('completed_at', { mode: 'timestamp' }),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export type UserWorkoutLog = typeof userWorkoutLogs.$inferInsert;
