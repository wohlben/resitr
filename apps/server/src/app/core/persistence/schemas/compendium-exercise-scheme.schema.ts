import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { MeasurementType } from '@resitr/api';
import { compendiumExercises } from './compendium-exercise.schema';

export const compendiumExerciseScheme = sqliteTable('compendium_exercise_schemes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
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

  createdBy: text('created_by').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type CompendiumExerciseScheme = typeof compendiumExerciseScheme.$inferInsert;
