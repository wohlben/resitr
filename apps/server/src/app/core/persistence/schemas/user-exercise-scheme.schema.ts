import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { MeasurementType } from '@resitr/api';
import { compendiumExercises } from './compendium-exercise.schema';

export const userExerciseSchemes = sqliteTable(
  'user_exercise_schemes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    measurementType: text('measurement_type').$type<MeasurementType>().notNull(),

    sets: integer('sets').notNull(),
    reps: integer('reps').notNull(),
    restBetweenSets: integer('rest_between_sets').notNull(),

    // REP_BASED EMOM RFT
    weight: real('weight'),
    timePerRep: integer('time_per_rep'),

    // TIME BASED AMRAP
    duration: integer('duration'),

    // DISTANCE BASED
    distance: real('distance'),
    targetTime: integer('target_time'),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
  },
  (table) => [
    index('user_exercise_schemes_user_id_idx').on(table.userId),
    index('user_exercise_schemes_exercise_id_idx').on(table.exerciseId),
    index('user_exercise_schemes_user_exercise_idx').on(table.userId, table.exerciseId),
  ]
);

export type UserExerciseScheme = typeof userExerciseSchemes.$inferSelect;
export type NewUserExerciseScheme = typeof userExerciseSchemes.$inferInsert;
