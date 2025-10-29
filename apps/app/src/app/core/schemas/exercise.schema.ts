import { type ExerciseTemplate } from '@resitr/api';

export type Exercise = Omit<ExerciseTemplate, 'templateId'> & {
  id: string;
  templateId?: string;
  importedAt: number;
};
export type  NewExercise = Omit<Exercise, 'id'>;
