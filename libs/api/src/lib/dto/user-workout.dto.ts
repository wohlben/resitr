import type { UserWorkout } from '../user-workout';

export type CreateUserWorkoutDto = {
  workoutTemplateId: string;
};

export type UserWorkoutResponseDto = UserWorkout;
