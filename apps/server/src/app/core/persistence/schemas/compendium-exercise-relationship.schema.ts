import { text, real, integer, sqliteTable, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { ExerciseRelationshipType } from '@resitr/api';
import { compendiumExercises } from './compendium-exercise.schema';

export const compendiumExerciseRelationship = sqliteTable(
  'compendium_exercise_relationships',
  {
    fromExerciseTemplateId: text('from_exercise_template_id')
      .notNull()
      .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),
    toExerciseTemplateId: text('to_exercise_template_id')
      .notNull()
      .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),
    relationshipType: text('relationship_type').$type<ExerciseRelationshipType>().notNull(),

    strength: real('strength'), // 0-1, how strong is this relationship
    description: text('description'),

    // Metadata
    createdBy: text('created_by').notNull(), // User ID who added this relationship
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    primaryKey({ columns: [table.fromExerciseTemplateId, table.toExerciseTemplateId, table.relationshipType] }),
    index('to_exercise_idx').on(table.toExerciseTemplateId),
  ]
);

export type CompendiumExerciseRelationship = typeof compendiumExerciseRelationship.$inferInsert;
