import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  userWorkoutSchedules,
  UserWorkoutSchedule,
  NewUserWorkoutSchedule,
} from '../schemas/user-workout-schedule.schema';

@Injectable()
export class UserWorkoutScheduleRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewUserWorkoutSchedule): Promise<UserWorkoutSchedule> {
    const [schedule] = await this.db
      .insert(userWorkoutSchedules)
      .values(data)
      .returning();
    return schedule;
  }

  async findAll(): Promise<UserWorkoutSchedule[]> {
    return this.db.select().from(userWorkoutSchedules);
  }

  async findByUserId(userId: string): Promise<UserWorkoutSchedule[]> {
    return this.db
      .select()
      .from(userWorkoutSchedules)
      .where(eq(userWorkoutSchedules.userId, userId))
      .orderBy(userWorkoutSchedules.dayOfWeek, userWorkoutSchedules.order);
  }

  async findByUserIdAndDay(
    userId: string,
    dayOfWeek: number
  ): Promise<UserWorkoutSchedule[]> {
    return this.db
      .select()
      .from(userWorkoutSchedules)
      .where(
        and(
          eq(userWorkoutSchedules.userId, userId),
          eq(userWorkoutSchedules.dayOfWeek, dayOfWeek)
        )
      )
      .orderBy(userWorkoutSchedules.order);
  }

  async findById(id: string): Promise<UserWorkoutSchedule | undefined> {
    const [schedule] = await this.db
      .select()
      .from(userWorkoutSchedules)
      .where(eq(userWorkoutSchedules.id, id))
      .limit(1);
    return schedule;
  }

  async update(
    id: string,
    data: Partial<NewUserWorkoutSchedule>
  ): Promise<UserWorkoutSchedule | undefined> {
    const [updated] = await this.db
      .update(userWorkoutSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userWorkoutSchedules.id, id))
      .returning();
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(userWorkoutSchedules)
      .where(eq(userWorkoutSchedules.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db
      .delete(userWorkoutSchedules)
      .where(eq(userWorkoutSchedules.userId, userId));
  }

  async deleteByUserIdAndWorkoutId(
    userId: string,
    workoutTemplateId: string
  ): Promise<void> {
    await this.db
      .delete(userWorkoutSchedules)
      .where(
        and(
          eq(userWorkoutSchedules.userId, userId),
          eq(userWorkoutSchedules.workoutTemplateId, workoutTemplateId)
        )
      );
  }
}
