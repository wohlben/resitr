import { WorkoutItem, WorkoutSection } from './workout.schema';
import { ExerciseScheme } from './exercise-scheme.schema';

export type WorkoutPlanItem = WorkoutItem & {
  goal: ExerciseScheme;
  achieved: Omit<ExerciseScheme, 'exerciseId' | 'id' | 'type'>;
  completedAt: number;
};

export type WorkoutPlanSection = Omit<WorkoutSection, 'items'> & {
  items: WorkoutPlanItem[];
  completedAt: number;
};

export type WorkoutLog = {
  id: string;
  workoutId: number;
  workoutName: string; // Snapshot of workout name at time of starting
  start: string;
  endTime?: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  plan: WorkoutPlanSection[];
};
export type NewWorkoutLog = Omit<WorkoutLog, 'id'>;
