import { ExerciseType } from './exercise-type';
import { ForceType } from './force-type';
import { MeasurementParadigm } from './measurement-paradigm';
import { Muscle } from './muscle';
import { TechnicalDifficulty } from './technical-difficulty';

export type ExerciseTemplate = {
  templateId: string;
  name: string;
  alternativeNames?: string[];
  type: ExerciseType;
  force: ForceType[];
  suggestedMeasurementParadigms?: MeasurementParadigm[];
  description?: string;
  instructions: string[];
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipmentIds: string[];
  bodyWeightScaling: number;
  technicalDifficulty: TechnicalDifficulty;
  images: string[];
  authorName?: string;
  authorUrl?: string;
  createdBy: string;
  version: number;
  updatedAt: string;
  createdAt: string;
};
