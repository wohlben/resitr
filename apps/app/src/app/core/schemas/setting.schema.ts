import { TechnicalDifficulty } from './technical-difficulty';
import { WeightUnitValue } from './weight-unit';

export type Settings = {
  weightUnit: WeightUnitValue;
  fitnessLevel: TechnicalDifficulty | null;
  userId: string | null;
}
export type Setting = {id: keyof Settings, value: Settings[keyof Settings]};
