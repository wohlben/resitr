export type WorkoutScheduleCriteria = {
  id: string;
  scheduleId: string;
  type: 'DAY_OF_WEEK';
  order: number;
  days: number[];
};

export type WorkoutSchedule = {
  id: string;
  userId: string;
  userWorkoutId: string;
  criteria: WorkoutScheduleCriteria[];
  createdAt: string;
  updatedAt: string | undefined;
};

export type CreateWorkoutScheduleRequest = {
  userWorkoutId: string;
};

export type CreateWorkoutScheduleCriteriaRequest = {
  type: 'DAY_OF_WEEK';
  days: number[];
};

export type UpdateWorkoutScheduleCriteriaRequest = {
  type: 'DAY_OF_WEEK';
  days: number[];
  order: number;
};
