import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
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

  async findById(id: number) {
    const [result] = await this.db.select().from(compendiumExerciseVideo).where(eq(compendiumExerciseVideo.id, id));
    return result;
  }

  async findByExerciseId(compendiumExerciseId: string) {
    return this.db
      .select()
      .from(compendiumExerciseVideo)
      .where(eq(compendiumExerciseVideo.compendiumExerciseId, compendiumExerciseId));
  }

  async update(id: number, data: Partial<CompendiumExerciseVideo>) {
    const [result] = await this.db
      .update(compendiumExerciseVideo)
      .set(data)
      .where(eq(compendiumExerciseVideo.id, id))
      .returning();
    return result;
  }

  async delete(id: number) {
    const [result] = await this.db
      .delete(compendiumExerciseVideo)
      .where(eq(compendiumExerciseVideo.id, id))
      .returning();
    return result;
  }
}
