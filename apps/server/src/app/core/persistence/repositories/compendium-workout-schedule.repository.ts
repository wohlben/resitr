import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { compendiumWorkoutSchedules, type CompendiumWorkoutSchedule } from '../schemas';

@Injectable()
export class CompendiumWorkoutScheduleRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: CompendiumWorkoutSchedule) {
    const [result] = await this.db.insert(compendiumWorkoutSchedules).values(data).returning();
    return result;
  }

  async findAll() {
    return this.db.select().from(compendiumWorkoutSchedules);
  }

  async findByWorkoutTemplateId(workoutTemplateId: string) {
    return this.db.select().from(compendiumWorkoutSchedules).where(eq(compendiumWorkoutSchedules.workoutTemplateId, workoutTemplateId));
  }

  async delete(workoutTemplateId: string, dayOfWeek: number) {
    const [result] = await this.db
      .delete(compendiumWorkoutSchedules)
      .where(
        and(
          eq(compendiumWorkoutSchedules.workoutTemplateId, workoutTemplateId),
          eq(compendiumWorkoutSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .returning();
    return result;
  }

  async deleteAllByWorkoutTemplateId(workoutTemplateId: string) {
    return this.db.delete(compendiumWorkoutSchedules).where(eq(compendiumWorkoutSchedules.workoutTemplateId, workoutTemplateId)).returning();
  }
}
