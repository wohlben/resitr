import type { ExerciseRelationshipType } from './exercise-relationship-type';

export type ExerciseRelationshipTemplate = {
  fromExerciseTemplateId: string;
  toExerciseTemplateId: string;
  relationshipType: ExerciseRelationshipType;
  strength?: number;
  description?: string;
  createdBy: string;
  createdAt: string;
};
