import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
import { compendiumExercises } from './compendium-exercise.schema';
import { sql } from 'drizzle-orm';
import { VideoSource } from '@resitr/api';

export const compendiumExerciseVideo = sqliteTable(
  'compendium_exercise_videos',
  {
    exerciseTemplateId: text('exercise_template_id')
      .notNull()
      .references(() => compendiumExercises.templateId, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    title: text('title'),
    description: text('description'),
    video_source: text('video_source').$type<VideoSource>(),

    createdBy: text('created_by').notNull(), // User ID who added this video
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [primaryKey({ columns: [table.exerciseTemplateId, table.url] })]
);

export type CompendiumExerciseVideo = typeof compendiumExerciseVideo.$inferInsert;
