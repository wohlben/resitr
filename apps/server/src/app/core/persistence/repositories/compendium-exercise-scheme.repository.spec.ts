import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseSchemeRepository } from './compendium-exercise-scheme.repository';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import { mockExercise, mockExerciseScheme } from '../test-factories';
import type { CompendiumExercise } from '../schemas/compendium-exercise.schema';
import { MeasurementType } from '@resitr/api';

describe('CompendiumExerciseSchemeRepository', () => {
  let repository: CompendiumExerciseSchemeRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [provideTestDatabase(), CompendiumExerciseSchemeRepository, CompendiumExerciseRepository],
    }).compile();

    repository = module.get<CompendiumExerciseSchemeRepository>(CompendiumExerciseSchemeRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create prerequisite test exercises
    testExercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1', name: 'Squat' }));
    testExercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2', name: 'Deadlift' }));
  });

  describe('create', () => {
    it('should create a scheme with all fields', async () => {
      const schemeData = mockExerciseScheme({
        exerciseId: testExercise1.templateId,
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
        timePerRep: 3,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        exerciseId: testExercise1.templateId,
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
        timePerRep: 3,
        createdBy: 'test-user',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create a time-based scheme', async () => {
      const schemeData = mockExerciseScheme({
        exerciseId: testExercise1.templateId,
        name: 'AMRAP 10 minutes',
        measurementType: MeasurementType.AMRAP,
        sets: 1,
        reps: 0,
        restBetweenSets: 0,
        duration: 600,
        weight: null,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        measurementType: MeasurementType.AMRAP,
        duration: 600,
      });
      expect(result.weight).toBeNull();
    });

    it('should create a distance-based scheme', async () => {
      const schemeData = mockExerciseScheme({
        exerciseId: testExercise1.templateId,
        name: '5K Run',
        measurementType: MeasurementType.DISTANCE_BASED,
        sets: 1,
        reps: 1,
        restBetweenSets: 0,
        distance: 5000,
        targetTime: 1800,
      });

      const result = await repository.create(schemeData);

      expect(result).toMatchObject({
        measurementType: MeasurementType.DISTANCE_BASED,
        distance: 5000,
        targetTime: 1800,
      });
    });

    it('should auto-generate id if not provided', async () => {
      const schemeData = mockExerciseScheme({
        exerciseId: testExercise1.templateId,
      });

      const result = await repository.create(schemeData);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should fail when exerciseId references non-existent exercise', async () => {
      const schemeData = mockExerciseScheme({
        exerciseId: 'non-existent-exercise',
      });

      await expect(repository.create(schemeData)).rejects.toThrow();
    });
  });

  describe('findAll', () => {
    it('should return all schemes', async () => {
      await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      await repository.create(mockExerciseScheme({ exerciseId: testExercise2.templateId, name: 'Scheme 3' }));

      const results = await repository.findAll();

      expect(results).toHaveLength(3);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2', 'Scheme 3']));
    });

    it('should return empty array when no schemes exist', async () => {
      const results = await repository.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a scheme by id', async () => {
      const created = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Find Me' }));

      const result = await repository.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        name: 'Find Me',
      });
    });

    it('should return undefined when scheme does not exist', async () => {
      const result = await repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByExerciseId', () => {
    it('should find all schemes for a specific exercise', async () => {
      await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      await repository.create(mockExerciseScheme({ exerciseId: testExercise2.templateId, name: 'Other Exercise' }));

      const results = await repository.findByExerciseId(testExercise1.templateId);

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.exerciseId === testExercise1.templateId)).toBe(true);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2']));
    });

    it('should return empty array when no schemes exist for exercise', async () => {
      const results = await repository.findByExerciseId(testExercise1.templateId);

      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update scheme fields', async () => {
      const created = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Original' }));

      const updated = await repository.update(created.id, {
        name: 'Updated',
        sets: 10,
        reps: 20,
      });

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Updated',
        sets: 10,
        reps: 20,
      });
    });

    it('should update optional fields to null', async () => {
      const created = await repository.create(
        mockExerciseScheme({
          exerciseId: testExercise1.templateId,
          weight: 100,
          timePerRep: 5,
        })
      );

      const updated = await repository.update(created.id, {
        weight: null,
        timePerRep: null,
      });

      expect(updated?.weight).toBeNull();
      expect(updated?.timePerRep).toBeNull();
    });

    it('should return undefined when updating non-existent scheme', async () => {
      const result = await repository.update('non-existent-id', { name: 'Updated' });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a scheme', async () => {
      const created = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId }));

      const deleted = await repository.delete(created.id);

      expect(deleted).toMatchObject({ id: created.id });

      const found = await repository.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent scheme', async () => {
      const result = await repository.delete('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('upsert', () => {
    it('should insert a new scheme when id does not exist', async () => {
      const schemeData = mockExerciseScheme({
        id: 'new-scheme-id',
        exerciseId: testExercise1.templateId,
        name: 'New Scheme',
      });

      const result = await repository.upsert(schemeData);

      expect(result).toMatchObject({
        id: 'new-scheme-id',
        name: 'New Scheme',
      });
    });

    it('should update existing scheme when id already exists', async () => {
      const created = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Original' }));

      const upserted = await repository.upsert({
        id: created.id,
        exerciseId: testExercise1.templateId,
        name: 'Updated via Upsert',
        measurementType: MeasurementType.REP_BASED,
        sets: 99,
        reps: 99,
        restBetweenSets: 99,
        createdBy: 'different-user',
      });

      expect(upserted).toMatchObject({
        id: created.id,
        name: 'Updated via Upsert',
        sets: 99,
      });
    });
  });

  describe('cascading deletes', () => {
    it('should delete schemes when parent exercise is deleted', async () => {
      const scheme1 = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 1' }));
      const scheme2 = await repository.create(mockExerciseScheme({ exerciseId: testExercise1.templateId, name: 'Scheme 2' }));
      const scheme3 = await repository.create(mockExerciseScheme({ exerciseId: testExercise2.templateId, name: 'Other' }));

      // Delete the parent exercise
      await exerciseRepository.delete(testExercise1.templateId);

      // Schemes for exercise 1 should be deleted
      const found1 = await repository.findById(scheme1.id);
      const found2 = await repository.findById(scheme2.id);
      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();

      // Scheme for exercise 2 should still exist
      const found3 = await repository.findById(scheme3.id);
      expect(found3).toBeDefined();
    });
  });
});
