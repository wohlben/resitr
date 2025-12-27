import type { ExerciseGroupTemplate } from '../exercise-group-template';

export type CreateExerciseGroupDto = Omit<ExerciseGroupTemplate, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;
export type UpdateExerciseGroupDto = CreateExerciseGroupDto & {id: ExerciseGroupTemplate['id']};
export type ExerciseGroupResponseDto = ExerciseGroupTemplate;
