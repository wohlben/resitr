import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { compendiumExercises } from './compendium-exercise.schema';
import { sql } from 'drizzle-orm';
import { VideoSource } from '@resitr/api';

export const compendiumExerciseVideo = sqliteTable(
  'compendium_exercise_video',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    compendiumExerciseId: text('compendium_exercise_id')
      .notNull()
      .references(() => compendiumExercises.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title'),
    description: text('description'),
    video_source: text('video_source').$type<VideoSource>(),

    createdBy: text('created_by').notNull(), // User ID who added this video
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [uniqueIndex('unique_video_per_exercise_idx').on(table.compendiumExerciseId, table.url)]
);

export type CompendiumExerciseVideo = typeof compendiumExerciseVideo.$inferInsert;
