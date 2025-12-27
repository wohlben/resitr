import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserWorkoutRepository } from '../../persistence/repositories/user-workout.repository';
import { UserWorkout } from '../../persistence/schemas/user-workout.schema';

@Injectable()
export class UserWorkoutService {
  constructor(private readonly workoutRepository: UserWorkoutRepository) {}

  async createUserWorkout(
    userId: string,
    workoutTemplateId: string
  ): Promise<UserWorkout> {
    const existing = await this.workoutRepository.findByUserIdAndWorkoutTemplateId(
      userId,
      workoutTemplateId
    );

    if (existing) {
      throw new ConflictException(
        'This workout is already added to your workouts.'
      );
    }

    return this.workoutRepository.create({
      userId,
      workoutTemplateId,
    });
  }

  async getUserWorkouts(userId: string): Promise<UserWorkout[]> {
    return this.workoutRepository.findByUserId(userId);
  }

  async getUserWorkoutById(
    userId: string,
    userWorkoutId: string
  ): Promise<UserWorkout> {
    const workout = await this.workoutRepository.findById(userWorkoutId);

    if (!workout) {
      throw new NotFoundException('User workout not found');
    }

    if (workout.userId !== userId) {
      throw new NotFoundException('User workout not found');
    }

    return workout;
  }

  async getUserWorkoutByTemplateId(
    userId: string,
    workoutTemplateId: string
  ): Promise<UserWorkout | undefined> {
    return this.workoutRepository.findByUserIdAndWorkoutTemplateId(
      userId,
      workoutTemplateId
    );
  }

  async deleteUserWorkout(userId: string, userWorkoutId: string): Promise<void> {
    const workout = await this.getUserWorkoutById(userId, userWorkoutId);
    await this.workoutRepository.delete(workout.id);
  }

  async deleteAllUserWorkouts(userId: string): Promise<void> {
    await this.workoutRepository.deleteByUserId(userId);
  }
}
