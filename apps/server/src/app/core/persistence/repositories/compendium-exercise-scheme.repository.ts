import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumExerciseScheme, type CompendiumExerciseScheme } from '../schemas';

@Injectable()
export class CompendiumExerciseSchemeRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExerciseScheme) {
    const [result] = await this.db.insert(compendiumExerciseScheme).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExerciseScheme);
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(compendiumExerciseScheme).where(eq(compendiumExerciseScheme.id, id));
    return result;
  }

  async findByExerciseId(exerciseId: string) {
    return this.db.select().from(compendiumExerciseScheme).where(eq(compendiumExerciseScheme.exerciseId, exerciseId));
  }

  async update(id: string, data: Partial<CompendiumExerciseScheme>) {
    const [result] = await this.db
      .update(compendiumExerciseScheme)
      .set(data)
      .where(eq(compendiumExerciseScheme.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db.delete(compendiumExerciseScheme).where(eq(compendiumExerciseScheme.id, id)).returning();
    return result;
  }

  async upsert(data: CompendiumExerciseScheme) {
    const { id, ...updateData } = data;
    const [result] = await this.db
      .insert(compendiumExerciseScheme)
      .values(data)
      .onConflictDoUpdate({
        target: compendiumExerciseScheme.id,
        set: updateData,
      })
      .returning();
    return result;
  }
}
