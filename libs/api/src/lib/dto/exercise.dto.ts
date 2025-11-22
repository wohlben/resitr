import type { ExerciseTemplate } from '../exercise-template';

export type CreateExerciseDto = Omit<ExerciseTemplate, 'createdAt' | 'updatedAt' | 'createdBy'>;
export type UpdateExerciseDto = Partial<CreateExerciseDto>;
export type ExerciseResponseDto = ExerciseTemplate;
