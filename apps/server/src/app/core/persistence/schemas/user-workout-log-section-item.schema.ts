import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { userWorkoutLogSections } from './user-workout-log-section.schema';
import { compendiumExercises } from './compendium-exercise.schema';

export const userWorkoutLogSectionItems = sqliteTable('user_workout_log_section_items', {
    id: text('id')
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    sectionId: text('section_id')
        .notNull()
        .references(() => userWorkoutLogSections.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
        .notNull()
        .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),

    name: text('name').notNull(), // Snapshot of exercise name
    orderIndex: integer('order_index').notNull(),
    restBetweenSets: integer('rest_between_sets').notNull(),
    breakAfter: integer('break_after').notNull(),

    completedAt: integer('completed_at', { mode: 'timestamp' }),

    createdBy: text('created_by').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type UserWorkoutLogSectionItem = typeof userWorkoutLogSectionItems.$inferInsert;
