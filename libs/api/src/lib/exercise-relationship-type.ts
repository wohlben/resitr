export enum ExerciseRelationshipType {
  // Progression relationships
  PREREQUISITE = 'prerequisite', // A must be done before B
  PROGRESSION = 'progression', // B is harder than A
  REGRESSION = 'regression', // B is easier than A

  // Component relationships
  COMPONENT_OF = 'component_of', // A is a part of B

  // Similarity relationships
  SIMILAR = 'similar', // Similar movement pattern
  ALTERNATIVE = 'alternative', // Alternative exercise

  // Derivative relationships
  FORK = 'fork', // B is a user-created variant of A
  DERIVATIVE = 'derivative', // B is derived from A

  // Combination
  SUPERSET_WITH = 'superset_with', // Often done together
  ANTAGONIST = 'antagonist', // Opposite muscle group
}

export const ExerciseRelationshipTypeLabels = {
  [ExerciseRelationshipType.PREREQUISITE]: 'Prerequisite',
  [ExerciseRelationshipType.PROGRESSION]: 'Progression',
  [ExerciseRelationshipType.REGRESSION]: 'Regression',
  [ExerciseRelationshipType.COMPONENT_OF]: 'Component Of',
  [ExerciseRelationshipType.SIMILAR]: 'Similar',
  [ExerciseRelationshipType.ALTERNATIVE]: 'Alternative',
  [ExerciseRelationshipType.FORK]: 'Fork',
  [ExerciseRelationshipType.DERIVATIVE]: 'Derivative',
  [ExerciseRelationshipType.SUPERSET_WITH]: 'Superset With',
  [ExerciseRelationshipType.ANTAGONIST]: 'Antagonist',
} as const satisfies Record<ExerciseRelationshipType, string>;
