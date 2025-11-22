import type { ExerciseRelationshipTemplate } from '../exercise-relationship-template';

export type CreateExerciseRelationshipDto = Omit<ExerciseRelationshipTemplate, 'createdBy' | 'createdAt'>;
export type UpdateExerciseRelationshipDto = Partial<Omit<CreateExerciseRelationshipDto, 'fromExerciseTemplateId' | 'toExerciseTemplateId' | 'relationshipType'>>;
export type ExerciseRelationshipResponseDto = ExerciseRelationshipTemplate;
