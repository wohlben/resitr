import { Inject, Injectable } from '@nestjs/common';
import { eq, and, sql, desc } from 'drizzle-orm';
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
    // Subquery to get max version per lineage
    const latestVersions = this.db
      .select({
        workoutLineageId: compendiumWorkouts.workoutLineageId,
        maxVersion: sql<number>`MAX(${compendiumWorkouts.version})`.as('max_version'),
      })
      .from(compendiumWorkouts)
      .groupBy(compendiumWorkouts.workoutLineageId)
      .as('latest');

    // Join to get full workout data for latest versions only
    const results = await this.db
      .select({
        templateId: compendiumWorkouts.templateId,
        workoutLineageId: compendiumWorkouts.workoutLineageId,
        name: compendiumWorkouts.name,
        description: compendiumWorkouts.description,
        sectionIds: compendiumWorkouts.sectionIds,
        createdBy: compendiumWorkouts.createdBy,
        createdAt: compendiumWorkouts.createdAt,
        updatedAt: compendiumWorkouts.updatedAt,
        version: compendiumWorkouts.version,
      })
      .from(compendiumWorkouts)
      .innerJoin(
        latestVersions,
        and(
          eq(compendiumWorkouts.workoutLineageId, latestVersions.workoutLineageId),
          eq(compendiumWorkouts.version, latestVersions.maxVersion)
        )
      );

    return results;
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

  async findByLineageId(lineageId: string) {
    return this.db
      .select()
      .from(compendiumWorkouts)
      .where(eq(compendiumWorkouts.workoutLineageId, lineageId))
      .orderBy(desc(compendiumWorkouts.version));
  }

  async delete(templateId: string) {
    const [result] = await this.db.delete(compendiumWorkouts).where(eq(compendiumWorkouts.templateId, templateId)).returning();
    return result;
  }
}
