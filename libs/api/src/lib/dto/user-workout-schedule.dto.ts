import type { UserWorkoutSchedule } from '../user-workout-schedule';

export type CreateUserWorkoutScheduleDto = {
  workoutTemplateId: string;
  dayOfWeek: number;
  order?: number;
};

export type UpdateUserWorkoutScheduleDto = {
  dayOfWeek?: number;
  order?: number;
};

export type UserWorkoutScheduleResponseDto = UserWorkoutSchedule;
