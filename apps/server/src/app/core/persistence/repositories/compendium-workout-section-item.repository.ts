import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumWorkoutSectionItems, type CompendiumWorkoutSectionItem } from '../schemas';

@Injectable()
export class CompendiumWorkoutSectionItemRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumWorkoutSectionItem) {
    const [result] = await this.db.insert(compendiumWorkoutSectionItems).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumWorkoutSectionItems);
  }

  async findById(id: string) {
    const [result] = await this.db.select().from(compendiumWorkoutSectionItems).where(eq(compendiumWorkoutSectionItems.id, id));
    return result;
  }

  async findByIds(ids: string[]) {
    if (ids.length === 0) return [];
    return this.db.select().from(compendiumWorkoutSectionItems).where(inArray(compendiumWorkoutSectionItems.id, ids));
  }

  async update(id: string, data: Partial<CompendiumWorkoutSectionItem>) {
    const [result] = await this.db
      .update(compendiumWorkoutSectionItems)
      .set(data)
      .where(eq(compendiumWorkoutSectionItems.id, id))
      .returning();
    return result;
  }

  async delete(id: string) {
    const [result] = await this.db.delete(compendiumWorkoutSectionItems).where(eq(compendiumWorkoutSectionItems.id, id)).returning();
    return result;
  }
}
