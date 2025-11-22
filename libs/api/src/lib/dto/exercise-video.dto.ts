import type { ExerciseVideoTemplate } from '../exercise-video-template';

export type CreateExerciseVideoDto = Omit<ExerciseVideoTemplate, 'createdBy' | 'createdAt'>;
export type UpdateExerciseVideoDto = Partial<Omit<CreateExerciseVideoDto, 'exerciseTemplateId' | 'url'>>;
export type ExerciseVideoResponseDto = ExerciseVideoTemplate;
