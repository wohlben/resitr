export enum WeightUnit {
  LBS = 'LBS',
  METRIC = 'METRIC',
}

export const WeightUnitLabels = {
  LBS: 'lbs',
  METRIC: 'metric',
} as const satisfies Record<WeightUnitKey, string>;

export type WeightUnitKey = keyof typeof WeightUnit;
export type WeightUnitValue = WeightUnit;
