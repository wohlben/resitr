export type UserWorkout = {
  id: string;
  userId: string;
  workoutTemplateId: string;
  createdAt: string;
  updatedAt?: string;
};

export type CreateUserWorkoutRequest = {
  workoutTemplateId: string;
};
