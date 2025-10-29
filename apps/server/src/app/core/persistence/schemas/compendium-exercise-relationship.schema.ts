import { text, real, integer, sqliteTable, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { ExerciseRelationshipType } from '@resitr/api';
import { compendiumExercises } from './compendium-exercise.schema';

export const compendiumExerciseRelationship = sqliteTable(
  'compendium_relationships',
  {
    id: text('id').primaryKey(),
    fromExerciseId: text('from_exercise_id')
      .notNull()
      .references(() => compendiumExercises.id, { onDelete: 'cascade' }),
    toExerciseId: text('to_exercise_id')
      .notNull()
      .references(() => compendiumExercises.id, { onDelete: 'cascade' }),
    relationshipType: text('relationship_type').$type<ExerciseRelationshipType>().notNull(),

    // Optional metadata
    strength: real('strength'), // 0-1, how strong is this relationship
    description: text('description'),

    // Metadata
    createdBy: text('created_by').notNull(), // User ID who added this relationship
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    uniqueIndex('unique_relationship_idx').on(table.fromExerciseId, table.toExerciseId, table.relationshipType),
  ]
);

export type CompendiumExerciseRelationship = typeof compendiumExerciseRelationship.$inferInsert;
