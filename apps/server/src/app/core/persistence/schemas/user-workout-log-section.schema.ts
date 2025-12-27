import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { WorkoutSectionType } from './compendium-workout-section.schema';

export const userWorkoutLogSections = sqliteTable('user_workout_log_sections', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text('name').notNull(),
    type: text('type').$type<WorkoutSectionType>().notNull(),
    itemIds: text('item_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),

    completedAt: integer('completed_at', { mode: 'timestamp' }),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type UserWorkoutLogSection = typeof userWorkoutLogSections.$inferInsert;
