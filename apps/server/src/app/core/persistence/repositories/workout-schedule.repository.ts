import { Inject, Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import { workoutSchedules, WorkoutSchedule, NewWorkoutSchedule } from '../schemas/workout-schedule.schema';

@Injectable()
export class WorkoutScheduleRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewWorkoutSchedule): Promise<WorkoutSchedule> {
    const [schedule] = await this.db.insert(workoutSchedules).values(data).returning();
    return schedule;
  }

  async findAll(): Promise<WorkoutSchedule[]> {
    return this.db.select().from(workoutSchedules);
  }

  async findByUserId(userId: string): Promise<WorkoutSchedule[]> {
    return this.db
      .select()
      .from(workoutSchedules)
      .where(eq(workoutSchedules.userId, userId))
      .orderBy(sql`${workoutSchedules.createdAt} DESC`);
  }

  async findByUserIdAndUserWorkoutId(userId: string, userWorkoutId: string): Promise<WorkoutSchedule | undefined> {
    const [schedule] = await this.db
      .select()
      .from(workoutSchedules)
      .where(and(eq(workoutSchedules.userId, userId), eq(workoutSchedules.userWorkoutId, userWorkoutId)))
      .limit(1);
    return schedule;
  }

  async findById(id: string): Promise<WorkoutSchedule | undefined> {
    const [schedule] = await this.db.select().from(workoutSchedules).where(eq(workoutSchedules.id, id)).limit(1);
    return schedule;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(workoutSchedules).where(eq(workoutSchedules.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(workoutSchedules).where(eq(workoutSchedules.userId, userId));
  }

  async deleteByUserIdAndUserWorkoutId(userId: string, userWorkoutId: string): Promise<void> {
    await this.db
      .delete(workoutSchedules)
      .where(and(eq(workoutSchedules.userId, userId), eq(workoutSchedules.userWorkoutId, userWorkoutId)));
  }
}
