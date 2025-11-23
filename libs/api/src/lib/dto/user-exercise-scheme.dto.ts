import type { UserExerciseScheme } from '../user-exercise-scheme';
import type { MeasurementType } from '../exercise-scheme-template';

export type CreateUserExerciseSchemeDto = {
  exerciseId: string;
  name: string;
  measurementType: MeasurementType;
  sets: number;
  reps: number;
  restBetweenSets: number;
  weight?: number;
  timePerRep?: number;
  duration?: number;
  distance?: number;
  targetTime?: number;
};

export type UpdateUserExerciseSchemeDto = {
  name?: string;
  measurementType?: MeasurementType;
  sets?: number;
  reps?: number;
  restBetweenSets?: number;
  weight?: number;
  timePerRep?: number;
  duration?: number;
  distance?: number;
  targetTime?: number;
};

export type UserExerciseSchemeResponseDto = UserExerciseScheme;

export type AssignToSectionItemDto = {
  sectionItemId: string;
  workoutTemplateId: string;
};

export type UnassignFromSectionItemDto = {
  sectionItemId: string;
  workoutTemplateId: string;
};
