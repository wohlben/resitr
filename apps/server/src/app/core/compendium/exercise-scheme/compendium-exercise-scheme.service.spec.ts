import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseSchemeService } from './compendium-exercise-scheme.service';
import { CompendiumExerciseSchemeRepository } from '../../persistence/repositories/compendium-exercise-scheme.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise, mockExerciseScheme } from '../../persistence/test-factories';
import type { CompendiumExercise } from '../../persistence/schemas/compendium-exercise.schema';
import { MeasurementType } from '@resitr/api';
import type { CreateExerciseSchemeDto } from '../../../routes/compendium/exercise-scheme/dto/exercise-scheme.dto';

describe('CompendiumExerciseSchemeService', () => {
  let service: CompendiumExerciseSchemeService;
  let repository: CompendiumExerciseSchemeRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let testExercise1: CompendiumExercise;
  let testExercise2: CompendiumExercise;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumExerciseSchemeRepository,
        CompendiumExerciseRepository,
        CompendiumExerciseSchemeService,
      ],
    }).compile();

    service = module.get<CompendiumExerciseSchemeService>(CompendiumExerciseSchemeService);
    repository = module.get<CompendiumExerciseSchemeRepository>(CompendiumExerciseSchemeRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);

    // Create prerequisite test exercises
    testExercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1', name: 'Squat' }));
    testExercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2', name: 'Deadlift' }));
  });

  describe('create', () => {
    it('should create a scheme with all fields', async () => {
      const schemeDto: CreateExerciseSchemeDto = {
        exerciseId: testExercise1.templateId,
        name: '5x5 Strength',
        measurementType: MeasurementType.REP_BASED,
        sets: 5,
        reps: 5,
        restBetweenSets: 180,
        weight: 225,
        timePerRep: 3,
      };

      const result = await service.create(schemeDto, 'user-1');

      expect(result).toMatchObject({
        ...schemeDto,
        createdBy: 'user-1',
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
    });

    it('should create a scheme with minimal fields', async () => {
      const schemeDto: CreateExerciseSchemeDto = {
        exerciseId: testExercise1.templateId,
        name: 'Simple Scheme',
        measurementType: MeasurementType.REP_BASED,
        sets: 3,
        reps: 10,
        restBetweenSets: 60,
      };

      const result = await service.create(schemeDto, 'user-2');

      expect(result).toMatchObject({
        ...schemeDto,
        createdBy: 'user-2',
      });
    });

    it('should create a time-based scheme', async () => {
      const schemeDto: CreateExerciseSchemeDto = {
        exerciseId: testExercise1.templateId,
        name: 'AMRAP 10 minutes',
        measurementType: MeasurementType.AMRAP,
        sets: 1,
        reps: 0,
        restBetweenSets: 0,
        duration: 600,
      };

      const result = await service.create(schemeDto, 'user-1');

      expect(result).toMatchObject({
        measurementType: MeasurementType.AMRAP,
        duration: 600,
        createdBy: 'user-1',
      });
    });

    it('should create a distance-based scheme', async () => {
      const schemeDto: CreateExerciseSchemeDto = {
        exerciseId: testExercise1.templateId,
        name: '5K Run',
        measurementType: MeasurementType.DISTANCE_BASED,
        sets: 1,
        reps: 1,
        restBetweenSets: 0,
        distance: 5000,
        targetTime: 1800,
      };

      const result = await service.create(schemeDto, 'user-1');

      expect(result).toMatchObject({
        measurementType: MeasurementType.DISTANCE_BASED,
        distance: 5000,
        targetTime: 1800,
      });
    });
  });

  describe('findAll', () => {
    it('should return all schemes', async () => {
      await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
        },
        'user-1'
      );
      await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
        },
        'user-1'
      );

      const results = await service.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.name)).toEqual(expect.arrayContaining(['Scheme 1', 'Scheme 2']));
    });

    it('should return empty array when no schemes exist', async () => {
      const results = await service.findAll();

      expect(results).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should find a scheme by id', async () => {
      const created = await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Find Me',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
        },
        'user-1'
      );

      const result = await service.findById(created.id);

      expect(result).toMatchObject({
        id: created.id,
        name: 'Find Me',
      });
    });

    it('should return undefined when scheme does not exist', async () => {
      const result = await service.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('findByExerciseId', () => {
    it('should find all schemes for a specific exercise', async () => {
      await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Scheme 1',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
        },
        'user-1'
      );
      await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Scheme 2',
          measurementType: MeasurementType.REP_BASED,
          sets: 5,
          reps: 5,
          restBetweenSets: 120,
        },
        'user-1'
      );
      await service.create(
        {
          exerciseId: testExercise2.templateId,
          name: 'Other Exercise',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 8,
          restBetweenSets: 90,
        },
        'user-1'
      );

      const results = await service.findByExerciseId(testExercise1.templateId);

      expect(results).toHaveLength(2);
      expect(results.every((s) => s.exerciseId === testExercise1.templateId)).toBe(true);
    });

    it('should return empty array when no schemes exist for exercise', async () => {
      const results = await service.findByExerciseId(testExercise1.templateId);

      expect(results).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update scheme fields', async () => {
      const created = await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Original',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
        },
        'user-1'
      );

      const updated = await service.update(
        created.id,
        {
          name: 'Updated',
          sets: 10,
          reps: 20,
        },
        'user-2'
      );

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Updated',
        sets: 10,
        reps: 20,
        createdBy: 'user-2', // Updated user
      });
    });

    it('should handle partial updates', async () => {
      const created = await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'Original',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
          weight: 100,
        },
        'user-1'
      );

      const updated = await service.update(
        created.id,
        {
          weight: 150,
        },
        'user-1'
      );

      expect(updated).toMatchObject({
        id: created.id,
        name: 'Original', // Unchanged
        weight: 150, // Updated
      });
    });

    it('should return undefined when updating non-existent scheme', async () => {
      const result = await service.update('non-existent-id', { name: 'Updated' }, 'user-1');

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a scheme', async () => {
      const created = await service.create(
        {
          exerciseId: testExercise1.templateId,
          name: 'To Delete',
          measurementType: MeasurementType.REP_BASED,
          sets: 3,
          reps: 10,
          restBetweenSets: 60,
        },
        'user-1'
      );

      const deleted = await service.delete(created.id);

      expect(deleted).toMatchObject({ id: created.id });

      const found = await service.findById(created.id);
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent scheme', async () => {
      const result = await service.delete('non-existent-id');

      expect(result).toBeUndefined();
    });
  });
});
