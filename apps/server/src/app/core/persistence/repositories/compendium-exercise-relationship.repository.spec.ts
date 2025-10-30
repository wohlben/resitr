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
      templateId: 'exercise-1',
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
      templateId: 'exercise-2',
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
      templateId: 'exercise-3',
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
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.8,
        description: 'Diamond push up is harder than standard',
        createdBy: 'user-1',
      };

      const result = await repository.create(relationshipData);

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.toExerciseTemplateId).toBe(testExercise2.templateId);
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION);
      expect(result.strength).toBe(0.8);
      expect(result.description).toBe('Diamond push up is harder than standard');
      expect(result.createdBy).toBe('user-1');
      expect(result.createdAt).toBeDefined();
    });

    it('should create relationship with minimal required fields', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      };

      const result = await repository.create(relationshipData);

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.toExerciseTemplateId).toBe(testExercise3.templateId);
      expect(result.strength).toBeNull();
      expect(result.description).toBeNull();
    });

    it('should create different relationship types', async () => {
      const progression: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      };

      const similar: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
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
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.ALTERNATIVE,
        createdBy: 'user-1',
      };

      await repository.create(relationshipData);

      const duplicateData: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: testExercise1.templateId, // Same
        toExerciseTemplateId: testExercise2.templateId, // Same
        relationshipType: ExerciseRelationshipType.ALTERNATIVE, // Same
        createdBy: 'user-2',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating relationship with non-existent from exercise', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: 'non-existent',
        toExerciseTemplateId: testExercise1.templateId,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      };

      await expect(repository.create(relationshipData)).rejects.toThrow();
    });

    it('should fail when creating relationship with non-existent to exercise', async () => {
      const relationshipData: CompendiumExerciseRelationship = {
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: 'non-existent',
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
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.SUPERSET_WITH,
        createdBy: 'user-1',
      });

      const result = await repository.findAll();

      expect(result).toHaveLength(3);
    });
  });

  describe('findByCompositeKey', () => {
    it('should find relationship by composite key', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        description: 'Test relationship',
        createdBy: 'user-1',
      });

      const result = await repository.findByCompositeKey(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.toExerciseTemplateId).toBe(testExercise2.templateId);
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION);
      expect(result.description).toBe('Test relationship');
    });

    it('should return undefined when relationship not found', async () => {
      const result = await repository.findByCompositeKey(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);
      expect(result).toBeUndefined();
    });
  });

  describe('findByFromExerciseId', () => {
    it('should find all relationships originating from an exercise', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise1.templateId,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.findByFromExerciseId(testExercise1.templateId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseTemplateId === testExercise1.templateId)).toBe(true);
    });

    it('should return empty array when exercise has no outgoing relationships', async () => {
      const result = await repository.findByFromExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });
  });

  describe('findByToExerciseId', () => {
    it('should find all relationships pointing to an exercise', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise3.templateId,
        toExerciseTemplateId: testExercise1.templateId,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.findByToExerciseId(testExercise3.templateId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.toExerciseTemplateId === testExercise3.templateId)).toBe(true);
    });

    it('should return empty array when exercise has no incoming relationships', async () => {
      const result = await repository.findByToExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });
  });

  describe('findByExerciseId', () => {
    it('should find all relationships involving an exercise (from or to)', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise1.templateId,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      const result = await repository.findByExerciseId(testExercise1.templateId);

      expect(result).toHaveLength(2);
      expect(result.every((r) => r.fromExerciseTemplateId === testExercise1.templateId || r.toExerciseTemplateId === testExercise1.templateId)).toBe(
        true
      );
    });

    it('should return empty array when exercise has no relationships', async () => {
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });
  });

  describe('findByRelationshipType', () => {
    it('should find relationships by from exercise and type', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      const result = await repository.findByRelationshipType(testExercise1.templateId, ExerciseRelationshipType.PROGRESSION);

      expect(result).toHaveLength(2);
      expect(
        result.every(
          (r) => r.fromExerciseTemplateId === testExercise1.templateId && r.relationshipType === ExerciseRelationshipType.PROGRESSION
        )
      ).toBe(true);
    });

    it('should return empty array when no matching relationships exist', async () => {
      const result = await repository.findByRelationshipType(testExercise1.templateId, ExerciseRelationshipType.FORK);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update relationship fields', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.5,
        createdBy: 'user-1',
      });

      const updateData = {
        strength: 0.9,
        description: 'Strong progression',
      };

      const result = await repository.update(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION, updateData);

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.toExerciseTemplateId).toBe(testExercise2.templateId);
      expect(result.strength).toBe(0.9);
      expect(result.description).toBe('Strong progression');
      expect(result.relationshipType).toBe(ExerciseRelationshipType.PROGRESSION); // Unchanged
    });

    it('should return undefined when updating non-existent relationship', async () => {
      const result = await repository.update(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION, {
        strength: 0.8,
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        strength: 0.7,
        description: 'Some description',
        createdBy: 'user-1',
      });

      const result = await repository.update(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION, {
        strength: null,
        description: null,
      });

      expect(result).toBeDefined();
      expect(result.strength).toBeNull();
      expect(result.description).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete relationship by composite key', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      const result = await repository.delete(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);

      expect(result).toBeDefined();
      expect(result.fromExerciseTemplateId).toBe(testExercise1.templateId);
      expect(result.toExerciseTemplateId).toBe(testExercise2.templateId);

      // Verify it's actually deleted
      const found = await repository.findByCompositeKey(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent relationship', async () => {
      const result = await repository.delete(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);
      expect(result).toBeUndefined();
    });

    it('should only delete specific relationship, not others', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      await repository.delete(testExercise1.templateId, testExercise2.templateId, ExerciseRelationshipType.PROGRESSION);

      // Verify the other relationship still exists
      const found = await repository.findByCompositeKey(testExercise1.templateId, testExercise3.templateId, ExerciseRelationshipType.ANTAGONIST);
      expect(found).toBeDefined();
    });
  });

  describe('cascading deletes', () => {
    it('should delete relationships when from exercise is deleted', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.ANTAGONIST,
        createdBy: 'user-1',
      });

      // Delete the from exercise
      await exerciseRepository.delete(testExercise1.templateId);

      // Verify all relationships with that exercise are deleted
      const result = await repository.findByFromExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);
    });

    it('should delete relationships when to exercise is deleted', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      // Delete the to exercise
      await exerciseRepository.delete(testExercise3.templateId);

      // Verify all relationships with that exercise are deleted
      const result = await repository.findByToExerciseId(testExercise3.templateId);
      expect(result).toEqual([]);
    });

    it('should delete all relationships when exercise involved in both directions is deleted', async () => {
      await repository.create({
        fromExerciseTemplateId: testExercise1.templateId,
        toExerciseTemplateId: testExercise2.templateId,
        relationshipType: ExerciseRelationshipType.PROGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise1.templateId,
        relationshipType: ExerciseRelationshipType.REGRESSION,
        createdBy: 'user-1',
      });

      await repository.create({
        fromExerciseTemplateId: testExercise2.templateId,
        toExerciseTemplateId: testExercise3.templateId,
        relationshipType: ExerciseRelationshipType.SIMILAR,
        createdBy: 'user-1',
      });

      // Delete exercise 1
      await exerciseRepository.delete(testExercise1.templateId);

      // Verify relationships involving exercise 1 are deleted
      const result = await repository.findByExerciseId(testExercise1.templateId);
      expect(result).toEqual([]);

      // Verify relationship not involving exercise 1 still exists
      const remaining = await repository.findByCompositeKey(testExercise2.templateId, testExercise3.templateId, ExerciseRelationshipType.SIMILAR);
      expect(remaining).toBeDefined();
    });
  });
});
