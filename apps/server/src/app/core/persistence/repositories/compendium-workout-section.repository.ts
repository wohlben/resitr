import { Inject, Injectable } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumWorkoutSections, type CompendiumWorkoutSection } from '../schemas';

@Injectable()
export class CompendiumWorkoutSectionRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumWorkoutSection) {
    const [result] = await this.db.insert(compendiumWorkoutSections).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumWorkoutSections);
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(compendiumWorkoutSections).where(eq(compendiumWorkoutSections.id, id));
    return result;
  }

  async findByWorkoutTemplateId(workoutTemplateId: string) {
    return this.db.select().from(compendiumWorkoutSections).where(eq(compendiumWorkoutSections.workoutTemplateId, workoutTemplateId)).orderBy(asc(compendiumWorkoutSections.orderIndex));
  }

  async update(id: string, data: Partial<CompendiumWorkoutSection>) {
    const [result] = await this.db
      .update(compendiumWorkoutSections)
      .set(data)
      .where(eq(compendiumWorkoutSections.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db.delete(compendiumWorkoutSections).where(eq(compendiumWorkoutSections.id, id)).returning();
    return result;
  }
}
