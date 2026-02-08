import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  workoutScheduleCriteriaDayOfWeek,
  WorkoutScheduleCriteriaDayOfWeek,
  NewWorkoutScheduleCriteriaDayOfWeek,
} from '../schemas/workout-schedule-criteria-day-of-week.schema';

@Injectable()
export class WorkoutScheduleCriteriaDayOfWeekRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewWorkoutScheduleCriteriaDayOfWeek): Promise<WorkoutScheduleCriteriaDayOfWeek> {
    const [day] = await this.db.insert(workoutScheduleCriteriaDayOfWeek).values(data).returning();
    return day;
  }

  async createMany(data: NewWorkoutScheduleCriteriaDayOfWeek[]): Promise<WorkoutScheduleCriteriaDayOfWeek[]> {
    if (data.length === 0) return [];
    return this.db.insert(workoutScheduleCriteriaDayOfWeek).values(data).returning();
  }

  async findByCriteriaId(criteriaId: string): Promise<WorkoutScheduleCriteriaDayOfWeek[]> {
    return this.db
      .select()
      .from(workoutScheduleCriteriaDayOfWeek)
      .where(eq(workoutScheduleCriteriaDayOfWeek.criteriaId, criteriaId));
  }

  async findByCriteriaIds(criteriaIds: string[]): Promise<WorkoutScheduleCriteriaDayOfWeek[]> {
    if (criteriaIds.length === 0) return [];
    return this.db
      .select()
      .from(workoutScheduleCriteriaDayOfWeek)
      .where(inArray(workoutScheduleCriteriaDayOfWeek.criteriaId, criteriaIds));
  }

  async deleteByCriteriaId(criteriaId: string): Promise<void> {
    await this.db
      .delete(workoutScheduleCriteriaDayOfWeek)
      .where(eq(workoutScheduleCriteriaDayOfWeek.criteriaId, criteriaId));
  }

  async deleteSpecificDay(criteriaId: string, dayOfWeek: number): Promise<void> {
    await this.db
      .delete(workoutScheduleCriteriaDayOfWeek)
      .where(
        and(
          eq(workoutScheduleCriteriaDayOfWeek.criteriaId, criteriaId),
          eq(workoutScheduleCriteriaDayOfWeek.dayOfWeek, dayOfWeek)
        )
      );
  }
}
