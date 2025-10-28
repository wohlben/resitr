import {
  MeasurementParadigm,
} from './measurement-paradigm';

export enum ExerciseType {
  STRENGTH = 'STRENGTH',
  CARDIO = 'CARDIO',
  STRETCHING = 'STRETCHING',
}

export const ExerciseTypeLabels = {
  STRENGTH: 'Strength',
  CARDIO: 'Cardio',
  STRETCHING: 'Stretching',
} as const satisfies Record<ExerciseType, string>;

export const ExerciseTypeDefaultParadigms = {
  STRENGTH: MeasurementParadigm.REP_BASED,
  CARDIO: MeasurementParadigm.TIME_BASED,
  STRETCHING: MeasurementParadigm.TIME_BASED,
} as const satisfies Record<ExerciseType, MeasurementParadigm>;
