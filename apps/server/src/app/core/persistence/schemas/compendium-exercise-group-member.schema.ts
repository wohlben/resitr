import { compendiumExercises } from './compendium-exercise.schema';
import { compendiumExerciseGroup } from './compendium-exercise-group.schema';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const compendiumExerciseGroupMember = sqliteTable(
  'compendium_exercise_group_member',
  {
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => compendiumExercises.id, { onDelete: 'cascade' }),
    groupId: text('group_id')
      .notNull()
      .references(() => compendiumExerciseGroup.id, { onDelete: 'cascade' }),

    // Metadata
    addedBy: text('added_by').notNull(), // User ID who added this exercise to the group
    addedAt: integer('added_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.exerciseId, table.groupId] })]
);

export type CompendiumExerciseGroupMember = typeof compendiumExerciseGroupMember.$inferInsert;
