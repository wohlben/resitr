import { sqliteTable, text, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { compendiumWorkoutSectionItems } from './compendium-workout-section-item.schema';
import { userExerciseSchemes } from './user-exercise-scheme.schema';
import { compendiumWorkouts } from './compendium-workout.schema';

export const userExerciseSchemeCompendiumWorkoutSectionItems = sqliteTable(
  'user_exercise_scheme_compendium_workout_section_items',
  {
    sectionItemId: text('section_item_id')
      .notNull()
      .references(() => compendiumWorkoutSectionItems.id, { onDelete: 'cascade' }),
    workoutTemplateId: text('workout_template_id')
      .notNull()
      .references(() => compendiumWorkouts.templateId, { onDelete: 'cascade' }),
    userExerciseSchemeId: text('user_exercise_scheme_id')
      .notNull()
      .references(() => userExerciseSchemes.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.sectionItemId, table.workoutTemplateId, table.userExerciseSchemeId] }),
    index('user_exercise_scheme_compendium_workout_section_items_workout_template_idx').on(table.workoutTemplateId),
  ]
);

export type UserExerciseSchemeCompendiumWorkoutSectionItem = typeof userExerciseSchemeCompendiumWorkoutSectionItems.$inferInsert;
