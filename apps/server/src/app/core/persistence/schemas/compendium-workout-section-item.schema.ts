import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumExercises } from './compendium-exercise.schema';

export const compendiumWorkoutSectionItems = sqliteTable('compendium_workout_section_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  exerciseId: text('exercise_id')
    .notNull()
    .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),
  breakBetweenSets: integer('break_between_sets').notNull(),
  breakAfter: integer('break_after').notNull(),
  forkedFrom: text('forked_from'),  // References the old item ID this was derived from

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

export type CompendiumWorkoutSectionItem = typeof compendiumWorkoutSectionItems.$inferInsert;
