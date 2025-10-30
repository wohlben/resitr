import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumExerciseVideo, type CompendiumExerciseVideo } from '../schemas';

@Injectable()
export class CompendiumExerciseVideoRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExerciseVideo) {
    const [result] = await this.db.insert(compendiumExerciseVideo).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExerciseVideo);
  }

  async findByCompositeKey(exerciseTemplateId: string, url: string) {
    const [result] = await this.db
      .select()
      .from(compendiumExerciseVideo)
      .where(and(eq(compendiumExerciseVideo.exerciseTemplateId, exerciseTemplateId), eq(compendiumExerciseVideo.url, url)));
    return result;
  }

  async findByExerciseId(exerciseTemplateId: string) {
    return this.db
      .select()
      .from(compendiumExerciseVideo)
      .where(eq(compendiumExerciseVideo.exerciseTemplateId, exerciseTemplateId));
  }

  async update(exerciseTemplateId: string, url: string, data: Partial<CompendiumExerciseVideo>) {
    const [result] = await this.db
      .update(compendiumExerciseVideo)
      .set(data)
      .where(and(eq(compendiumExerciseVideo.exerciseTemplateId, exerciseTemplateId), eq(compendiumExerciseVideo.url, url)))
      .returning();
    return result;
  }

  async delete(exerciseTemplateId: string, url: string) {
    const [result] = await this.db
      .delete(compendiumExerciseVideo)
      .where(and(eq(compendiumExerciseVideo.exerciseTemplateId, exerciseTemplateId), eq(compendiumExerciseVideo.url, url)))
      .returning();
    return result;
  }

  async upsert(data: CompendiumExerciseVideo) {
    const { exerciseTemplateId, url, ...updateData } = data;
    const [result] = await this.db
      .insert(compendiumExerciseVideo)
      .values(data)
      .onConflictDoUpdate({
        target: [compendiumExerciseVideo.exerciseTemplateId, compendiumExerciseVideo.url],
        set: updateData,
      })
      .returning();
    return result;
  }
}
