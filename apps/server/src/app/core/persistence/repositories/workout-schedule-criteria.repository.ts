import { Inject, Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  workoutScheduleCriteria,
  WorkoutScheduleCriteria,
  NewWorkoutScheduleCriteria,
} from '../schemas/workout-schedule-criteria.schema';

@Injectable()
export class WorkoutScheduleCriteriaRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewWorkoutScheduleCriteria): Promise<WorkoutScheduleCriteria> {
    const [criteria] = await this.db.insert(workoutScheduleCriteria).values(data).returning();
    return criteria;
  }

  async findByScheduleId(scheduleId: string): Promise<WorkoutScheduleCriteria[]> {
    return this.db
      .select()
      .from(workoutScheduleCriteria)
      .where(eq(workoutScheduleCriteria.scheduleId, scheduleId))
      .orderBy(workoutScheduleCriteria.order);
  }

  async findById(id: string): Promise<WorkoutScheduleCriteria | undefined> {
    const [criteria] = await this.db
      .select()
      .from(workoutScheduleCriteria)
      .where(eq(workoutScheduleCriteria.id, id))
      .limit(1);
    return criteria;
  }

  async findByIdAndScheduleId(id: string, scheduleId: string): Promise<WorkoutScheduleCriteria | undefined> {
    const [criteria] = await this.db
      .select()
      .from(workoutScheduleCriteria)
      .where(and(eq(workoutScheduleCriteria.id, id), eq(workoutScheduleCriteria.scheduleId, scheduleId)))
      .limit(1);
    return criteria;
  }

  async update(id: string, data: Partial<NewWorkoutScheduleCriteria>): Promise<WorkoutScheduleCriteria | undefined> {
    const [updated] = await this.db
      .update(workoutScheduleCriteria)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workoutScheduleCriteria.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workoutScheduleCriteria).where(eq(workoutScheduleCriteria.id, id));
  }

  async deleteByScheduleId(scheduleId: string): Promise<void> {
    await this.db.delete(workoutScheduleCriteria).where(eq(workoutScheduleCriteria.scheduleId, scheduleId));
  }

  async getNextOrderForSchedule(scheduleId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(workoutScheduleCriteria)
      .where(eq(workoutScheduleCriteria.scheduleId, scheduleId));
    return result[0]?.count ?? 0;
  }
}
