import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { compendiumWorkoutSections } from './compendium-workout-section.schema';

export const compendiumWorkoutSectionItems = sqliteTable('compendium_workout_section_items', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sectionId: text('section_id')
    .notNull()
    .references(() => compendiumWorkoutSections.id, { onDelete: 'cascade' }),
  orderIndex: integer('order_index').notNull(),
  breakBetweenSets: integer('break_between_sets').notNull(),
  breakAfter: integer('break_after').notNull(),

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type CompendiumWorkoutSectionItem = typeof compendiumWorkoutSectionItems.$inferInsert;
