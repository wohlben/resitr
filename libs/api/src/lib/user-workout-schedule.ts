export type UserWorkoutSchedule = {
  id: string;
  userId: string;
  workoutTemplateId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  order: number; // Order for multiple workouts on same day
  createdAt: string;
  updatedAt?: string;
};

export type CreateUserWorkoutScheduleRequest = {
  workoutTemplateId: string;
  dayOfWeek: number;
  order?: number;
};

export type UpdateUserWorkoutScheduleRequest = {
  dayOfWeek?: number;
  order?: number;
};
