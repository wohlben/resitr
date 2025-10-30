import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumExerciseGroup, type CompendiumExerciseGroup } from '../schemas';

@Injectable()
export class CompendiumExerciseGroupRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumExerciseGroup) {
    const [result] = await this.db.insert(compendiumExerciseGroup).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumExerciseGroup);
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(compendiumExerciseGroup).where(eq(compendiumExerciseGroup.id, id));
    return result;
  }

  async findByName(name: string) {
    const [result] = await this.db.select().from(compendiumExerciseGroup).where(eq(compendiumExerciseGroup.name, name));
    return result;
  }

  async update(id: string, data: Partial<CompendiumExerciseGroup>) {
    const updateData = {
      ...data,
      updatedAt: sql`(unixepoch())`,
    };

    const [result] = await this.db
      .update(compendiumExerciseGroup)
      .set(updateData)
      .where(eq(compendiumExerciseGroup.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db
      .delete(compendiumExerciseGroup)
      .where(eq(compendiumExerciseGroup.id, id))
      .returning();
    return result;
  }

  async upsert(data: CompendiumExerciseGroup) {
    const { id, ...updateData } = data;
    const [result] = await this.db
      .insert(compendiumExerciseGroup)
      .values(data)
      .onConflictDoUpdate({
        target: compendiumExerciseGroup.id,
        set: {
          ...updateData,
          updatedAt: sql`(unixepoch())`,
        },
      })
      .returning();
    return result;
  }
}
