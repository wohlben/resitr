export enum MeasurementType {
  REP_BASED = 'REP_BASED',
  TIME_BASED = 'TIME_BASED',
  DISTANCE_BASED = 'DISTANCE_BASED',
  AMRAP = 'AMRAP',
  EMOM = 'EMOM',
  ROUNDS_FOR_TIME = 'ROUNDS_FOR_TIME',
}

export const MeasurementTypeLabels = {
  [MeasurementType.REP_BASED]: 'Rep Based',
  [MeasurementType.TIME_BASED]: 'Time Based',
  [MeasurementType.DISTANCE_BASED]: 'Distance Based',
  [MeasurementType.AMRAP]: 'AMRAP',
  [MeasurementType.EMOM]: 'EMOM',
  [MeasurementType.ROUNDS_FOR_TIME]: 'Rounds for Time',
} as const satisfies Record<MeasurementType, string>;

export type ExerciseSchemeTemplate = {
  id: string;
  exerciseId: string;
  name: string;
  measurementType: MeasurementType;

  sets: number;
  reps: number;
  restBetweenSets: number;

  // REP_BASED EMOM RFT
  weight?: number;
  timePerRep?: number;

  // TIME BASED AMRAP
  duration?: number;

  // DISTANCE BASED
  distance?: number;
  targetTime?: number;

  createdBy: string;
  createdAt: string;
};
