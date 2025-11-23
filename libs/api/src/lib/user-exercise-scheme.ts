import { MeasurementType } from './exercise-scheme-template';

export type UserExerciseScheme = {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt?: string;
};

export type CreateUserExerciseSchemeRequest = {
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

export type UpdateUserExerciseSchemeRequest = {
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
