import { WeightUnitValue } from './weight-unit';
import {type TechnicalDifficulty } from '@resitr/api';

export type Settings = {
  weightUnit: WeightUnitValue;
  fitnessLevel: TechnicalDifficulty | null;
  userId: string | null;
}
export type Setting = {id: keyof Settings, value: Settings[keyof Settings]};
