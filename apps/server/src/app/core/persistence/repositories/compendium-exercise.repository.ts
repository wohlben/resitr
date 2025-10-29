import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumExercises, type CompendiumExercise } from '../schemas';

@Injectable()
export class CompendiumExerciseRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExercise) {
    const [result] = await this.db.insert(compendiumExercises).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExercises);
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(compendiumExercises).where(eq(compendiumExercises.id, id));
    return result;
  }

  async findBySlug(slug: string) {
    const [result] = await this.db.select().from(compendiumExercises).where(eq(compendiumExercises.slug, slug));
    return result;
  }

  async findByParentId(parentExerciseId: string) {
    return this.db.select().from(compendiumExercises).where(eq(compendiumExercises.parentExerciseId, parentExerciseId));
  }

  async update(id: string, data: Partial<CompendiumExercise>) {
    const updateData = {
      ...data,
      updatedAt: sql`(unixepoch())`,
      version: sql`${compendiumExercises.version} + 1`,
    };

    const [result] = await this.db
      .update(compendiumExercises)
      .set(updateData)
      .where(eq(compendiumExercises.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db.delete(compendiumExercises).where(eq(compendiumExercises.id, id)).returning();
    return result;
  }
}
