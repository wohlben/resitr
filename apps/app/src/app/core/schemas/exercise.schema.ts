import { ExerciseTemplate } from './exercise-template';

export type Exercise = Omit<ExerciseTemplate, 'templateId'> & {
  id: string;
  templateId?: string;
  importedAt: number;
};
export type  NewExercise = Omit<Exercise, 'id'>;
