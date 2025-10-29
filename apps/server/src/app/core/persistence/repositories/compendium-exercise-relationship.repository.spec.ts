import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseRelationshipRepository } from './compendium-exercise-relationship.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumExerciseRelationship } from '../schemas';
import type { CompendiumExercise } from '../schemas';
import { ExerciseRelationshipType, ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';

describe('CompendiumExerciseRelationshipRepository', () => {
  let repository: CompendiumExerciseRelationshipRepository;
  let exerciseRepository: CompendiumExerciseRepository;

  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;
  let testExercise3: CompendiumExercise;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseRelationshipRepository, CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumExerciseRelationshipRepository>(CompendiumExerciseRelationshipRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create test exercises
    testExercise1 = await exerciseRepository.create({
      id: 'exercise-1',
      name: 'Push Up',
      slug: 'push-up',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.CHEST],
      secondaryMuscles: [Muscle.TRICEPS],
      technicalDifficulty: TechnicalDifficulty.BEGINNER,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: ['Do push up'],
      createdBy: 'user-1',
    });

    testExercise2 = await exerciseRepository.create({
      id: 'exercise-2',
      name: 'Diamond Push Up',
      slug: 'diamond-push-up',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PUSH],
      primaryMuscles: [Muscle.TRICEPS],
      secondaryMuscles: [Muscle.CHEST],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: [],
      bodyWeightScaling: 1,
      instructions: ['Do diamond push up'],
      createdBy: 'user-1',
    });

    testExercise3 = await exerciseRepository.create({
      id: 'exercise-3',
      name: 'Pull Up',
      slug: 'pull-up',
      type: ExerciseType.STRENGTH,
      force: [ForceType.PULL],
      primaryMuscles: [Muscle.LATS],
      secondaryMuscles: [Muscle.BICEPS],
      technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      equipmentIds: ['pull-up-bar'],
      bodyWeightScaling: 1,
      instructions: ['Pull up'],
      createdBy: 'user-1',
    });
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new relationship with all fields', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.8,
        description: 'Diamond push up is harder than standard',
        createdBy: 'user-1',
      };

      const result = await repository.create(relationshipData);

      expect(result).toBeDefined();
      expect(result.id).toBe(relationshipData.id);
      expect(result.fromExerciseId).toBe(testExercise1.id);
      expect(result.toExerciseId).toBe(testExercise2.id);
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION);
      expect(result.strength).toBe(0.8);
      expect(result.description).toBe('Diamond push up is harder than standard');
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should create relationship with minimal required fields', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      };

      const result = await repository.create(relationshipData);

      expect(result).toBeDefined();
      expect(result.id).toBe(relationshipData.id);
      expect(result.strength).toBeNull();
      expect(result.description).toBeNull();
    });

    it('should create different relationship types', async () => {
      const progression: CompendiumExerciseRelationship = {
        id: 'rel-prog',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      };

      const similar: CompendiumExerciseRelationship = {
        id: 'rel-sim',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      };

      const result1 = await repository.create(progression);
      const result2 = await repository.create(similar);

      expect(result1.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION);
      expect(result2.relationshipType).toBe(ExerciseRelationshipType.SIMILAR);
    });

    it('should fail when creating duplicate relationship (same from, to, and type)', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        id: 'rel-3',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        createdBy: 'user-1',
      };

      await repository.create(relationshipData);

      const duplicateData: CompendiumExerciseRelationship = {
        id: 'rel-4',
        fromExerciseId: testExercise1.id, // Same
        toExerciseId: testExercise2.id, // Same
        relationshipType: ExerciseRelationshipType.ALTERNATIVE, // Same
        createdBy: 'user-2',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating relationship with non-existent from exercise', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        id: 'rel-5',
        fromExerciseId: 'non-existent',
        toExerciseId: testExercise1.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      };

      await expect(repository.create(relationshipData)).rejects.toThrow();
    });

    it('should fail when creating relationship with non-existent to exercise', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        id: 'rel-6',
        fromExerciseId: testExercise1.id,
        toExerciseId: 'non-existent',
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      };

      await expect(repository.create(relationshipData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return empty array when no relationships exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all relationships', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.SUPERSET_WITH,
        createdBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findById', () => {
    it('should find relationship by id', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        description: 'Test relationship',
        createdBy: 'user-1',
      });

      const result = await repository.findById('rel-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('rel-1');
      expect(result.description).toBe('Test relationship');
    });

    it('should return undefined when relationship not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findByFromExerciseId', () => {
    it('should find all relationships originating from an exercise', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise1.id,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.findByFromExerciseId(testExercise1.id);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseId === testExercise1.id)).toBe(true);
    });

    it('should return empty array when exercise has no outgoing relationships', async () => {
      const result = await repository.findByFromExerciseId(testExercise1.id);
      expect(result).toEqual([]);
    });
  });

  describe('findByToExerciseId', () => {
    it('should find all relationships pointing to an exercise', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise3.id,
        toExerciseId: testExercise1.id,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.findByToExerciseId(testExercise3.id);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.toExerciseId === testExercise3.id)).toBe(true);
    });

    it('should return empty array when exercise has no incoming relationships', async () => {
      const result = await repository.findByToExerciseId(testExercise1.id);
      expect(result).toEqual([]);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all relationships involving an exercise (from or to)', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise1.id,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      const result = await repository.findByExerciseId(testExercise1.id);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseId === testExercise1.id || r.toExerciseId === testExercise1.id)).toBe(
        true
      );
    });

    it('should return empty array when exercise has no relationships', async () => {
      const result = await repository.findByExerciseId(testExercise1.id);
      expect(result).toEqual([]);
    });
  });

  describe('findByRelationshipType', () => {
    it('should find relationships by from exercise and type', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      const result = await repository.findByRelationshipType(testExercise1.id, ExerciseRelationshipType.PROGRESSION);

      expect(result).toHaveLength(2);
      expect(
        result.every(
          (r) => r.fromExerciseId === testExercise1.id && r.relationshipType === ExerciseRelationshipType.PROGRESSION
        )
      ).toBe(true);
    });

    it('should return empty array when no matching relationships exist', async () => {
      const result = await repository.findByRelationshipType(testExercise1.id, ExerciseRelationshipType.FORK);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update relationship fields', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.5,
        createdBy: 'user-1',
      });

      const updateData = {
        strength: 0.9,
        description: 'Strong progression',
      };

      const result = await repository.update('rel-1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('rel-1');
      expect(result.strength).toBe(0.9);
      expect(result.description).toBe('Strong progression');
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION); // Unchanged
    });

    it('should update relationship type', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      const result = await repository.update('rel-1', {
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
      });

      expect(result).toBeDefined();
      expect(result.relationshipType).toBe(ExerciseRelationshipType.ALTERNATIVE);
    });

    it('should return undefined when updating non-existent relationship', async () => {
      const result = await repository.update('non-existent-id', {
        strength: 0.8,
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.7,
        description: 'Some description',
        createdBy: 'user-1',
      });

      const result = await repository.update('rel-1', {
        strength: null,
        description: null,
      });

      expect(result).toBeDefined();
      expect(result.strength).toBeNull();
      expect(result.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete relationship by id', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.delete('rel-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('rel-1');

      // Verify it's actually deleted
      const found = await repository.findById('rel-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent relationship', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should only delete specific relationship, not others', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.delete('rel-1');

      // Verify the other relationship still exists
      const found = await repository.findById('rel-2');
      expect(found).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete relationships when from exercise is deleted', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      // Delete the from exercise
      await exerciseRepository.delete(testExercise1.id);

      // Verify all relationships with that exercise are deleted
      const result = await repository.findByFromExerciseId(testExercise1.id);
      expect(result).toEqual([]);
    });

    it('should delete relationships when to exercise is deleted', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      // Delete the to exercise
      await exerciseRepository.delete(testExercise3.id);

      // Verify all relationships with that exercise are deleted
      const result = await repository.findByToExerciseId(testExercise3.id);
      expect(result).toEqual([]);
    });

    it('should delete all relationships when exercise involved in both directions is deleted', async () => {
      await repository.create({
        id: 'rel-1',
        fromExerciseId: testExercise1.id,
        toExerciseId: testExercise2.id,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-2',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise1.id,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        id: 'rel-3',
        fromExerciseId: testExercise2.id,
        toExerciseId: testExercise3.id,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      // Delete exercise 1
      await exerciseRepository.delete(testExercise1.id);

      // Verify relationships involving exercise 1 are deleted
      const result = await repository.findByExerciseId(testExercise1.id);
      expect(result).toEqual([]);

      // Verify relationship not involving exercise 1 still exists
      const remaining = await repository.findById('rel-3');
      expect(remaining).toBeDefined();
    });
  });
});
