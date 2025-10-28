import { TechnicalDifficulty } from './technical-difficulty';
import { WeightUnitValue } from './weight-unit';

export interface SettingsSchema {
  weightUnit: WeightUnitValue;
  fitnessLevel: TechnicalDifficulty | null;
  userId: string | null;
}
