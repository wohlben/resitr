export type WorkoutItem =
  | {
      type: 'exercise';
      exerciseId: string;
    }
  | {
      type: 'rest';
    };

export type WorkoutSectionType = 'WARMUP' | 'TRAINING' | 'COOLDOWN';

export interface WorkoutSection {
  name: string;
  type: WorkoutSectionType;
  items: WorkoutItem[];
}
export type Workout = {
  id: string;
  name: string;
  description?: string;
  sections: WorkoutSection[];
  createdAt: number;
  updatedAt: number;
};
export type NewWorkout = Omit<Workout, 'id'>;
