import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumWorkouts, type CompendiumWorkout } from '../schemas';

@Injectable()
export class CompendiumWorkoutRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumWorkout) {
    const [result] = await this.db.insert(compendiumWorkouts).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumWorkouts);
  }

  async findById(templateId: string) {
    const [result] = await this.db.select().from(compendiumWorkouts).where(eq(compendiumWorkouts.templateId, templateId));
    return result;
  }

  async update(templateId: string, data: Partial<CompendiumWorkout>) {
    const [result] = await this.db
      .update(compendiumWorkouts)
      .set(data)
      .where(eq(compendiumWorkouts.templateId, templateId))
      .returning();
    return result;
  }

  async delete(templateId: string) {
    const [result] = await this.db.delete(compendiumWorkouts).where(eq(compendiumWorkouts.templateId, templateId)).returning();
    return result;
  }
}
