import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import { ExerciseType, ForceType, Muscle, TechnicalDifficulty } from '@resitr/api';
import { mockExercise } from '../test-factories';

describe('CompendiumExerciseRepository', () => {
  let repository: CompendiumExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a new exercise with all fields', async () => {
      const exerciseData = mockExercise({
        templateId: 'ex-1',
        name: 'Bench Press',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [Muscle.TRICEPS, Muscle.FRONT_DELTS],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell', 'bench'],
        description: 'A classic chest exercise',
        instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
        images: ['image1.jpg', 'image2.jpg'],
        alternativeNames: ['Barbell Press'],
        authorName: 'John Doe',
        authorUrl: 'https://example.com/johndoe',
        createdBy: 'user-1',
      });

      const result = await repository.create(exerciseData);

      expect(result).toMatchObject(exerciseData);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('should create exercise with minimal required fields', async () => {
      const exerciseData = mockExercise({
        templateId: 'ex-2',
        description: null,
        authorName: null,
      });

      const result = await repository.create(exerciseData);

      expect(result).toMatchObject({
        templateId: 'ex-2',
        description: null,
        authorName: null,
      });
    });

    it('should create exercise variant', async () => {
      // Create parent exercise first
      const parentExercise = mockExercise({
        templateId: 'parent-ex-1',
      });

      await repository.create(parentExercise);

      // Create variant exercise
      const variantExercise = mockExercise({
        templateId: 'variant-ex-1',
      });

      const result = await repository.create(variantExercise);

      expect(result).toBeDefined();
    });

    it('should fail when creating exercise with duplicate id', async () => {
      const exerciseData = mockExercise({
        templateId: 'ex-3',
      });

      await repository.create(exerciseData);

      const duplicateData = mockExercise({
        templateId: 'ex-3', // Same ID - this is what the test is about
      });

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

  });

  describe('findAll', () => {
    it('should return empty array when no exercises exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all exercises', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));
      await repository.create(mockExercise({ templateId: 'ex-2' }));

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find exercise by id', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));

      const result = await repository.findById('ex-1');

      expect(result).toBeDefined();
      expect(result?.templateId).toBe('ex-1');
    });

    it('should return undefined when exercise not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });


  describe('update', () => {
    it('should update exercise fields', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));

      const result = await repository.update('ex-1', {
        description: 'Updated description',
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
      });

      expect(result).toMatchObject({
        description: 'Updated description',
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        version: 2,
      });
    });

    it('should increment version on each update', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));

      const update1 = await repository.update('ex-1', { description: 'First' });
      expect(update1.version).toBe(2);

      const update2 = await repository.update('ex-1', { description: 'Second' });
      expect(update2.version).toBe(3);

      const update3 = await repository.update('ex-1', { description: 'Third' });
      expect(update3.version).toBe(4);
    });

    it('should return undefined when updating non-existent exercise', async () => {
      const result = await repository.update('non-existent-id', {
        description: 'Updated Description',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      await repository.create(mockExercise({
        templateId: 'ex-1',
        description: 'Some description',
        authorName: 'Author',
      }));

      const result = await repository.update('ex-1', {
        description: null,
        authorName: null,
      });

      expect(result.description).toBeNull();
      expect(result.authorName).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert new exercise when it does not exist', async () => {
      const result = await repository.upsert(mockExercise({ templateId: 'ex-upsert-1' }));

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-upsert-1');
      expect(result.version).toBe(1);

      const found = await repository.findById('ex-upsert-1');
      expect(found).toBeDefined();
    });

    it('should update existing exercise and increment version', async () => {
      const created = await repository.create(mockExercise({ templateId: 'ex-upsert-2' }));
      expect(created.version).toBe(1);

      const result = await repository.upsert(mockExercise({
        templateId: 'ex-upsert-2',
        description: 'Updated',
        version: 2,
      }));

      expect(result).toMatchObject({
        templateId: 'ex-upsert-2',
        description: 'Updated',
        version: 2,
      });

      const allExercises = await repository.findAll();
      expect(allExercises).toHaveLength(1);
    });

    it('should handle multiple upserts and increment version each time', async () => {
      const templateId = 'ex-upsert-3';

      const result1 = await repository.upsert(mockExercise({ templateId }));
      expect(result1.version).toBe(1);

      const result2 = await repository.upsert(mockExercise({ templateId, description: 'First' }));
      expect(result2.version).toBe(2);
      expect(result2.description).toBe('First');

      const result3 = await repository.upsert(mockExercise({ templateId, description: 'Second' }));
      expect(result3.version).toBe(3);
      expect(result3.description).toBe('Second');

      const allExercises = await repository.findAll();
      expect(allExercises).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete exercise by id', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));

      const result = await repository.delete('ex-1');

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-1');

      const found = await repository.findById('ex-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent exercise', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should delete and allow recreation with new id', async () => {
      await repository.create(mockExercise({ templateId: 'ex-1' }));
      await repository.delete('ex-1');

      const result = await repository.create(mockExercise({ templateId: 'ex-2' }));
      expect(result.templateId).toBe('ex-2');
    });

  });
});
