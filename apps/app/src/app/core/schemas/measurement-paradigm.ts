export enum MeasurementParadigm {
  REP_BASED = 'REP_BASED',
  TIME_BASED = 'TIME_BASED',
  DISTANCE_BASED = 'DISTANCE_BASED',
  AMRAP = 'AMRAP',
  EMOM = 'EMOM',
}

export const MeasurementParadigmDescriptions = {
  REP_BASED:
    'Traditional sets and reps (e.g., 3 sets of 10 reps). Goal: complete prescribed reps',
  TIME_BASED:
    'Duration-based exercises (e.g., hold plank for 60 seconds, stretch for 30 seconds). Goal: hold for prescribed time',
  DISTANCE_BASED:
    'Distance-based exercises (e.g., run 5km, row 2000m). Goal: complete prescribed distance',
  AMRAP:
    'As Many Reps/Rounds As Possible in a given time (e.g., max pull-ups in 2 minutes). Goal: more is better',
  EMOM: 'Every Minute On the Minute - perform X reps at the start of each minute, rest for remainder (e.g., 10 burpees EMOM for 10 minutes). Goal: complete work within each minute',
} as const satisfies Record<MeasurementParadigm, string>;

export const MeasurementParadigmLabels = {
  REP_BASED: 'Rep Based',
  TIME_BASED: 'Time Based',
  DISTANCE_BASED: 'Distance Based',
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
} as const satisfies Record<MeasurementParadigm, string>;
