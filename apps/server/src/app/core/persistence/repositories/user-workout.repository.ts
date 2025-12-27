import { Inject, Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DATABASE, type Database } from '../database';
import {
  userWorkouts,
  UserWorkout,
  NewUserWorkout,
} from '../schemas/user-workout.schema';

@Injectable()
export class UserWorkoutRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async create(data: NewUserWorkout): Promise<UserWorkout> {
    const [workout] = await this.db
      .insert(userWorkouts)
      .values(data)
      .returning();
    return workout;
  }

  async findAll(): Promise<UserWorkout[]> {
    return this.db.select().from(userWorkouts);
  }

  async findByUserId(userId: string): Promise<UserWorkout[]> {
    return this.db
      .select()
      .from(userWorkouts)
      .where(eq(userWorkouts.userId, userId));
  }

  async findById(id: string): Promise<UserWorkout | undefined> {
    const [workout] = await this.db
      .select()
      .from(userWorkouts)
      .where(eq(userWorkouts.id, id))
      .limit(1);
    return workout;
  }

  async findByUserIdAndWorkoutTemplateId(
    userId: string,
    workoutTemplateId: string
  ): Promise<UserWorkout | undefined> {
    const [workout] = await this.db
      .select()
      .from(userWorkouts)
      .where(
        and(
          eq(userWorkouts.userId, userId),
          eq(userWorkouts.workoutTemplateId, workoutTemplateId)
        )
      )
      .limit(1);
    return workout;
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(userWorkouts).where(eq(userWorkouts.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(userWorkouts).where(eq(userWorkouts.userId, userId));
  }
}
