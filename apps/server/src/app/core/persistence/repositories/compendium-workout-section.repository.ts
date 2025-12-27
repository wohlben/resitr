import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
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

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db.select().from(compendiumWorkoutSections).where(inArray(compendiumWorkoutSections.id, ids));
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
