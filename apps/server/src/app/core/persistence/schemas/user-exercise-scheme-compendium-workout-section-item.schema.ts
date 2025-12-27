import { sqliteTable, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { compendiumWorkoutSectionItems } from './compendium-workout-section-item.schema';
import { userExerciseSchemes } from './user-exercise-scheme.schema';
import { userWorkouts } from './user-workout.schema';

export const userExerciseSchemeCompendiumWorkoutSectionItems = sqliteTable(
  'user_exercise_scheme_compendium_workout_section_items',
  {
    sectionItemId: text('section_item_id')
      .notNull()
      .references(() => compendiumWorkoutSectionItems.id, { onDelete: 'cascade' }),
    userWorkoutId: text('user_workout_id')
      .notNull()
      .references(() => userWorkouts.id, { onDelete: 'cascade' }),
    userExerciseSchemeId: text('user_exercise_scheme_id')
      .notNull()
      .references(() => userExerciseSchemes.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.sectionItemId, table.userWorkoutId, table.userExerciseSchemeId] }),
    index('user_exercise_scheme_compendium_workout_section_items_user_workout_idx').on(table.userWorkoutId),
  ]
);

export type UserExerciseSchemeCompendiumWorkoutSectionItem = typeof userExerciseSchemeCompendiumWorkoutSectionItems.$inferInsert;
