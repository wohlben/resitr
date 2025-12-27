import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumExercises } from './compendium-exercise.schema';

export const userWorkoutLogSectionItems = sqliteTable('user_workout_log_section_items', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    exerciseId: text('exercise_id')
        .notNull()
        .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),

    name: text('name').notNull(), // Snapshot of exercise name
    restBetweenSets: integer('rest_between_sets').notNull(),
    breakAfter: integer('break_after').notNull(),
    setIds: text('set_ids', { mode: 'json' }).$type<string[]>().notNull().default([]),

    completedAt: integer('completed_at', { mode: 'timestamp' }),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type UserWorkoutLogSectionItem = typeof userWorkoutLogSectionItems.$inferInsert;
