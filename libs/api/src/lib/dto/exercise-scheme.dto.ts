import type { ExerciseSchemeTemplate } from '../exercise-scheme-template';

export type CreateExerciseSchemeDto = Omit<ExerciseSchemeTemplate, 'id' | 'createdBy' | 'createdAt'>;
export type UpdateExerciseSchemeDto = Partial<CreateExerciseSchemeDto>;
export type ExerciseSchemeResponseDto = ExerciseSchemeTemplate;
