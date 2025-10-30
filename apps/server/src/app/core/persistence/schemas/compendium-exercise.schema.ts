import { text, real, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import {
  type ExerciseType,
  type ForceType,
  type MeasurementParadigm,
  type Muscle,
  TechnicalDifficulty,
} from '@resitr/api';

const exerciseFields = {
  templateId: text('template_id').notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),

  type: text('type').$type<ExerciseType>().notNull(),
  force: text('force', { mode: 'json' }).$type<ForceType[]>().notNull(),
  primaryMuscles: text('primary_muscles', { mode: 'json' }).$type<Muscle[]>().notNull(),
  secondaryMuscles: text('secondary_muscles', { mode: 'json' }).$type<Muscle[]>().notNull(),

  technicalDifficulty: text('technical_difficulty').$type<TechnicalDifficulty>().notNull(),
  equipmentIds: text('equipment_ids', { mode: 'json' }).$type<string[]>().notNull(),
  bodyWeightScaling: real('body_weight_scaling').notNull().default(0),

  suggestedMeasurementParadigms: text('suggested_measurement_paradigms', { mode: 'json' }).$type<
    MeasurementParadigm[]
  >(),

  description: text('description'),
  instructions: text('instructions', { mode: 'json' }).$type<string[]>().notNull(),
  images: text('images', { mode: 'json' })
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'`),
  alternativeNames: text('alternative_names', { mode: 'json' }).$type<string[]>(),

  // Attribution
  authorName: text('author_name'),
  authorUrl: text('author_url'),

  // Metadata
  createdBy: text('created_by').notNull(), // User ID who contributed this
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),

  // Versioning
  version: integer('version').notNull().default(1),
} as const;

export const compendiumExercises = sqliteTable('compendium_exercises', {
  ...exerciseFields,
  templateId: text('template_id').primaryKey(),
  slug: text('slug').notNull().unique(),
  parentExerciseId: text('parent_exercise_id').references(() => compendiumExercises.templateId),
});

export const compendiumExercisesHistory = sqliteTable('compendium_exercises_history', {
  auditId: integer('history_id').primaryKey({ autoIncrement: true }),
  operation: text('operation', { enum: ['INSERT', 'UPDATE', 'DELETE'] }).notNull(),
  changedAt: integer('changed_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),

  ...exerciseFields,
});

export type CompendiumExercise = typeof compendiumExercises.$inferInsert;
export type CompendiumExerciseHistory = typeof compendiumExercisesHistory.$inferInsert;
