import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumExercises, type CompendiumExercise } from '../schemas';

@Injectable()
export class CompendiumExerciseRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExercise) {
    const result = await this.db.insert(compendiumExercises).values(data).returning();
    return result[0];
  }

  async findAll() {
    return this.db.select().from(compendiumExercises);
  }

  async findById(templateId: string) {
    const [result] = await this.db.select().from(compendiumExercises).where(eq(compendiumExercises.templateId, templateId));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await this.db.select().from(compendiumExercises).where(eq(compendiumExercises.slug, slug));
    return result;
  }

  async findByParentId(parentExerciseId: string) {
    return this.db.select().from(compendiumExercises).where(eq(compendiumExercises.parentExerciseId, parentExerciseId));
  }

  async update(templateId: string, data: Partial<CompendiumExercise>) {
    const updateData = {
      ...data,
      updatedAt: sql`(unixepoch())`,
      version: sql`${compendiumExercises.version} + 1`,
    };

    const result = await this.db
      .update(compendiumExercises)
      .set(updateData)
      .where(eq(compendiumExercises.templateId, templateId))
      .returning();
    return result[0];
  }

  async delete(templateId: string) {
    const result = await this.db.delete(compendiumExercises).where(eq(compendiumExercises.templateId, templateId)).returning();
    return result[0];
  }

  async upsert(data: CompendiumExercise) {
    const { templateId, ...updateData } = data;
    const result = await this.db
      .insert(compendiumExercises)
      .values(data)
      .onConflictDoUpdate({
        target: compendiumExercises.templateId,
        set: {
          ...updateData,
          updatedAt: sql`(unixepoch())`,
          version: sql`${compendiumExercises.version} + 1`,
        },
      })
      .returning();
    return result[0];
  }
}
