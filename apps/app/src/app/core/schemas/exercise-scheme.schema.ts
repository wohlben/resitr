import {type MeasurementParadigm } from '@resitr/api';

export type ExerciseScheme = {
  id: number;
  exerciseId: string;

  type: MeasurementParadigm;

  seconds?: number;
  reps?: number;
  weight?: number;
  secondsPerRep?: number;
  distance?: number;
};

export type NewExerciseScheme = Omit<ExerciseScheme, 'id'>

