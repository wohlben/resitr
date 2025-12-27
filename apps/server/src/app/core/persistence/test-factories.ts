/**
 * Test Factory Utilities
 *
 * Centralized factory functions for creating test data across the test suite.
 * This reduces boilerplate and makes schema changes easier to maintain.
 *
 * Usage:
 * - Use the factory functions to create baseline test data
 * - Override specific fields as needed: mockExercise({ name: 'Custom Name' })
 * - All factories return valid entities that pass schema validation
 */

import type { CompendiumExercise } from './schemas/compendium-exercise.schema';
import type { NewCompendiumEquipment } from './schemas/compendium-equipment.schema';
import type { CompendiumExerciseGroup } from './schemas/compendium-exercise-group.schema';
import type { CompendiumExerciseGroupMember } from './schemas/compendium-exercise-group-member.schema';
import type { CompendiumExerciseRelationship } from './schemas/compendium-exercise-relationship.schema';
import type { CompendiumExerciseScheme } from './schemas/compendium-exercise-scheme.schema';
import type { CompendiumExerciseVideo } from './schemas/compendium-exercise-video.schema';
import type { CompendiumWorkout } from './schemas/compendium-workout.schema';
import type { CompendiumWorkoutSection } from './schemas/compendium-workout-section.schema';
import type { CompendiumWorkoutSectionItem } from './schemas/compendium-workout-section-item.schema';
import type { UserWorkoutSchedule } from './schemas/user-workout-schedule.schema';
import type { NewUserExerciseScheme } from './schemas/user-exercise-scheme.schema';
import {
  ExerciseType,
  ForceType,
  Muscle,
  TechnicalDifficulty,
  MeasurementParadigm,
  MeasurementType,
  EquipmentCategory,
  ExerciseRelationshipType,
  VideoSource,
} from '@resitr/api';
import { WorkoutSectionType } from './schemas/compendium-workout-section.schema';

/**
 * Creates a mock CompendiumExercise with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExercise(overrides: Partial<CompendiumExercise> = {}): CompendiumExercise {
  return {
    templateId: 'test-exercise-1',
    name: 'Test Exercise',
    type: ExerciseType.STRENGTH,
    force: [ForceType.PUSH],
    primaryMuscles: [Muscle.CHEST],
    secondaryMuscles: [Muscle.TRICEPS],
    technicalDifficulty: TechnicalDifficulty.BEGINNER,
    equipmentIds: [],
    bodyWeightScaling: 0,
    suggestedMeasurementParadigms: [MeasurementParadigm.REP_BASED],
    description: 'A test exercise for unit tests',
    instructions: ['Step 1', 'Step 2', 'Step 3'],
    images: [],
    alternativeNames: [],
    authorName: null,
    authorUrl: null,
    createdBy: 'test-user',
    version: 1,
    ...overrides,
  } satisfies CompendiumExercise ;
}

/**
 * Creates a mock CompendiumEquipment with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockEquipment(overrides: Partial<NewCompendiumEquipment> = {}): NewCompendiumEquipment {
  return {
    templateId: 'test-equipment-1',
    name: 'test-equipment',
    displayName: 'Test Equipment',
    description: 'A test equipment for unit tests',
    category: EquipmentCategory.free_weights,
    imageUrl: null,
    ...overrides,
  } satisfies NewCompendiumEquipment;
}

/**
 * Creates a mock CompendiumExerciseGroup with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExerciseGroup(
  overrides: Partial<CompendiumExerciseGroup> = {}
): CompendiumExerciseGroup {
  return {
    id: 'test-group-1',
    name: 'Test Exercise Group',
    description: 'A test exercise group for unit tests',
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumExerciseGroup;
}

/**
 * Creates a mock CompendiumExerciseGroupMember with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExerciseGroupMember(
  overrides: Partial<CompendiumExerciseGroupMember> = {}
): CompendiumExerciseGroupMember {
  return {
    groupId: 'test-group-1',
    exerciseTemplateId: 'test-exercise-1',
    addedBy: 'test-user',
    ...overrides,
  } satisfies CompendiumExerciseGroupMember;
}

/**
 * Creates a mock CompendiumExerciseRelationship with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExerciseRelationship(
  overrides: Partial<CompendiumExerciseRelationship> = {}
): CompendiumExerciseRelationship {
  return {
    fromExerciseTemplateId: 'test-exercise-1',
    toExerciseTemplateId: 'test-exercise-2',
    relationshipType: ExerciseRelationshipType.SIMILAR,
    strength: null,
    description: null,
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumExerciseRelationship;
}

/**
 * Creates a mock CompendiumExerciseScheme with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExerciseScheme(
  overrides: Partial<CompendiumExerciseScheme> = {}
): CompendiumExerciseScheme {
  return {
    exerciseId: 'test-exercise-1',
    name: 'Test Scheme',
    measurementType: MeasurementType.REP_BASED,
    sets: 3,
    reps: 10,
    restBetweenSets: 60,
    weight: 100,
    timePerRep: null,
    duration: null,
    distance: null,
    targetTime: null,
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumExerciseScheme;
}

/**
 * Creates a mock CompendiumExerciseVideo with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockExerciseVideo(
  overrides: Partial<CompendiumExerciseVideo> = {}
): CompendiumExerciseVideo {
  return {
    exerciseTemplateId: 'test-exercise-1',
    url: 'https://example.com/video.mp4',
    title: 'Test Exercise Video',
    description: 'A test video for unit tests',
    video_source: VideoSource.YOUTUBE,
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumExerciseVideo;
}

/**
 * Helper to create multiple exercises with sequential IDs.
 * Useful for tests that need multiple distinct exercises.
 */
export function mockExercises(count: number, baseOverrides: Partial<CompendiumExercise> = {}): CompendiumExercise[] {
  return Array.from({ length: count }, (_, i) =>
    mockExercise({
      ...baseOverrides,
      templateId: `test-exercise-${i + 1}`,
      name: `Test Exercise ${i + 1}`,
    })
  ) satisfies CompendiumExercise[];
}

/**
 * Helper to create multiple equipment items with sequential IDs.
 * Useful for tests that need multiple distinct equipment items.
 */
export function mockEquipments(count: number, baseOverrides: Partial<NewCompendiumEquipment> = {}): NewCompendiumEquipment[] {
  return Array.from({ length: count }, (_, i) =>
    mockEquipment({
      ...baseOverrides,
      templateId: `test-equipment-${i + 1}`,
      name: `test-equipment-${i + 1}`,
      displayName: `Test Equipment ${i + 1}`,
    })
  ) satisfies NewCompendiumEquipment[];
}

/**
 * Creates a mock CompendiumWorkout with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockWorkout(
  overrides: Partial<CompendiumWorkout> = {}
): CompendiumWorkout {
  return {
    templateId: 'test-workout-1',
    workoutLineageId: 'test-lineage-1',
    name: 'Test Workout',
    description: 'A test workout for unit tests',
    sectionIds: [],
    createdBy: 'test-user',
    version: 1,
    ...overrides,
  } satisfies CompendiumWorkout;
}

/**
 * Creates a mock CompendiumWorkoutSection with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockWorkoutSection(
  overrides: Partial<CompendiumWorkoutSection> = {}
): CompendiumWorkoutSection {
  return {
    type: WorkoutSectionType.STRENGTH,
    name: 'Test Section',
    workoutSectionItemIds: [],
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumWorkoutSection;
}

/**
 * Creates a mock CompendiumWorkoutSectionItem with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockWorkoutSectionItem(
  overrides: Partial<CompendiumWorkoutSectionItem> = {}
): CompendiumWorkoutSectionItem {
  return {
    exerciseId: 'test-exercise-1',
    breakBetweenSets: 60,
    breakAfter: 120,
    createdBy: 'test-user',
    ...overrides,
  } satisfies CompendiumWorkoutSectionItem;
}

/**
 * Creates a mock UserWorkoutSchedule with sensible defaults.
 * Override any fields by passing a partial object.
 * Note: id is omitted to allow database auto-generation
 */
export function mockUserWorkoutSchedule(
  overrides: Partial<UserWorkoutSchedule> = {}
): Omit<UserWorkoutSchedule, 'id' | 'createdAt'> & { id?: string; createdAt?: Date } {
  return {
    userId: 'test-user',
    workoutTemplateId: 'test-workout-1',
    dayOfWeek: 1, // Monday
    order: 0,
    updatedAt: null,
    ...overrides,
  };
}

/**
 * Creates a mock UserExerciseScheme with sensible defaults.
 * Override any fields by passing a partial object.
 */
export function mockUserExerciseScheme(
  overrides: Partial<NewUserExerciseScheme> = {}
): NewUserExerciseScheme {
  return {
    userId: 'test-user',
    exerciseId: 'test-exercise-1',
    name: 'Test User Scheme',
    measurementType: MeasurementType.REP_BASED,
    sets: 3,
    reps: 10,
    restBetweenSets: 60,
    weight: 100,
    timePerRep: null,
    duration: null,
    distance: null,
    targetTime: null,
    ...overrides,
  } satisfies NewUserExerciseScheme;
}
