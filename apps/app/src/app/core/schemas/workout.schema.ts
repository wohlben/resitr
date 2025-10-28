import { MeasurementParadigm } from './measurement-paradigm';

export type WorkoutItemGoals = {
      type: MeasurementParadigm;
      seconds: number;
      reps?: number;
      weight?: number;
      secondsPerRep?: number;
      distance?: number
    }

export type WorkoutItem =
  | {
      id: string; // only for progress tracking
      type: 'exercise';
      exerciseId: string;
      goal: WorkoutItemGoals;
      achieved: WorkoutItemGoals;
      completedAt: number;
    }
  | {
      id: string;
      type: 'rest';
      completedAt: number;
    };

export type WorkoutSectionType = 'WARMUP' | 'TRAINING' | 'COOLDOWN';

export interface WorkoutSection {
  id: string; // only for progress tracking
  name: string;
  type: WorkoutSectionType;
  items: WorkoutItem[];
  completedAt: number;
}
export type Workout = {
  id: number;
  name: string;
  description?: string;
  sections: WorkoutSection[];
  createdAt: number;
  updatedAt: number;
  completedAt: number;
};
export type NewWorkout = Omit<Workout, 'id'>;
