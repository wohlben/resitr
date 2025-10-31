import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumExerciseRepository } from './compendium-exercise.repository';
import { provideTestDatabase } from '../database';
import type { CompendiumExercise } from '../schemas';
import { ExerciseType, ForceType, Muscle, TechnicalDifficulty, MeasurementParadigm } from '@resitr/api';

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
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Bench Press',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [Muscle.TRICEPS, Muscle.FRONT_DELTS],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell', 'bench'],
        bodyWeightScaling: 0,
        suggestedMeasurementParadigms: [MeasurementParadigm.REP_BASED],
        description: 'A classic chest exercise',
        instructions: ['Lie on bench', 'Lower bar to chest', 'Press up'],
        images: ['image1.jpg', 'image2.jpg'],
        alternativeNames: ['Barbell Press'],
        authorName: 'John Doe',
        authorUrl: 'https://example.com/johndoe',
        createdBy: 'user-1',
        version: 1,
      };

      const result = await repository.create(exerciseData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe(exerciseData.templateId);
      expect(result.name).toBe(exerciseData.name);
      expect(result.type).toBe(exerciseData.type);
      expect(result.force).toEqual(exerciseData.force);
      expect(result.primaryMuscles).toEqual(exerciseData.primaryMuscles);
      expect(result.secondaryMuscles).toEqual(exerciseData.secondaryMuscles);
      expect(result.technicalDifficulty).toBe(exerciseData.technicalDifficulty);
      expect(result.equipmentIds).toEqual(exerciseData.equipmentIds);
      expect(result.bodyWeightScaling).toBe(exerciseData.bodyWeightScaling);
      expect(result.description).toBe(exerciseData.description);
      expect(result.instructions).toEqual(exerciseData.instructions);
      expect(result.images).toEqual(exerciseData.images);
      expect(result.alternativeNames).toEqual(exerciseData.alternativeNames);
      expect(result.authorName).toBe(exerciseData.authorName);
      expect(result.authorUrl).toBe(exerciseData.authorUrl);
      expect(result.createdBy).toBe(exerciseData.createdBy);
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.version).toBe(1);
    });

    it('should create exercise with minimal required fields', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-2',
        name: 'Push Up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Get in plank position', 'Lower body', 'Push up'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const result = await repository.create(exerciseData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe(exerciseData.templateId);
      expect(result.name).toBe(exerciseData.name);
      expect(result.description).toBeNull();
      expect(result.authorName).toBeNull();
    });

    it('should create exercise variant', async () => {
      // Create parent exercise first
      const parentExercise: CompendiumExercise = {
        templateId: 'parent-ex-1',
        name: 'Standard Squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [Muscle.GLUTES],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Stand with bar', 'Lower down', 'Stand up'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(parentExercise);

      // Create variant exercise
      const variantExercise: CompendiumExercise = {
        templateId: 'variant-ex-1',
        name: 'Front Squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [Muscle.GLUTES],
        technicalDifficulty: TechnicalDifficulty.ADVANCED,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Hold bar in front', 'Lower down', 'Stand up'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const result = await repository.create(variantExercise);

      expect(result).toBeDefined();
    });

    it('should fail when creating exercise with duplicate id', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-3',
        name: 'Deadlift',
        type: ExerciseType.STRENGTH,
        force: [ForceType.HINGE],
        primaryMuscles: [Muscle.LOWER_BACK],
        secondaryMuscles: [Muscle.GLUTES, Muscle.HAMSTRINGS],
        technicalDifficulty: TechnicalDifficulty.ADVANCED,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Lift bar from ground'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const duplicateData: CompendiumExercise = {
        ...exerciseData,
        name: 'Different Name',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

  });

  describe('findAll', () => {
    it('should return empty array when no exercises exist', async () => {
      const result = await repository.findAll();
      expect(result).toEqual([]);
    });

    it('should return all exercises', async () => {
      const exercise1: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Stand with bar', 'Lower', 'Stand up'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const exercise2: CompendiumExercise = {
        templateId: 'ex-2',
        name: 'Running',
        type: ExerciseType.CARDIO,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS, Muscle.CALVES],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Run at steady pace'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exercise1);
      await repository.create(exercise2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find exercise by id', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Plank',
        type: ExerciseType.STRENGTH,
        force: [ForceType.STATIC],
        primaryMuscles: [Muscle.ABS],
        secondaryMuscles: [Muscle.LOWER_BACK],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Hold plank position'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const result = await repository.findById('ex-1');

      expect(result).toBeDefined();
      expect(result?.templateId).toBe('ex-1');
      expect(result?.name).toBe('Plank');
    });

    it('should return undefined when exercise not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });


  describe('update', () => {
    it('should update exercise fields', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Rowing',
        type: ExerciseType.CARDIO,
        force: [ForceType.PULL],
        primaryMuscles: [Muscle.LATS],
        secondaryMuscles: [Muscle.BICEPS],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: ['rowing-machine'],
        bodyWeightScaling: 0,
        instructions: ['Row steadily'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const updateData = {
        description: 'A great full-body cardio exercise',
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        secondaryMuscles: [Muscle.BICEPS, Muscle.LOWER_BACK],
      };

      const result = await repository.update('ex-1', updateData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-1');
      expect(result.name).toBe('Rowing'); // Unchanged
      expect(result.description).toBe('A great full-body cardio exercise'); // Updated
      expect(result.technicalDifficulty).toBe(TechnicalDifficulty.INTERMEDIATE); // Updated
      expect(result.secondaryMuscles).toEqual([Muscle.BICEPS, Muscle.LOWER_BACK]); // Updated
      expect(result.updatedAt).toBeDefined();
      expect(result.version).toBe(2); // Version incremented
    });

    it('should increment version on each update', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Test Exercise',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const update1 = await repository.update('ex-1', { description: 'First update' });
      expect(update1.version).toBe(2);

      const update2 = await repository.update('ex-1', { description: 'Second update' });
      expect(update2.version).toBe(3);

      const update3 = await repository.update('ex-1', { description: 'Third update' });
      expect(update3.version).toBe(4);
    });

    it('should return undefined when updating non-existent exercise', async () => {
      const result = await repository.update('non-existent-id', {
        description: 'Updated Description',
      });

      expect(result).toBeUndefined();
    });

    it('should be able to clear optional fields', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Test',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        images: [],
        description: 'Some description',
        authorName: 'Author',
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const result = await repository.update('ex-1', {
        description: null,
        authorName: null,
      });

      expect(result).toBeDefined();
      expect(result.description).toBeNull();
      expect(result.authorName).toBeNull();
    });
  });

  describe('upsert', () => {
    it('should insert new exercise when it does not exist', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-upsert-1',
        name: 'Upsert Test Exercise',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [Muscle.TRICEPS],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Step 1', 'Step 2'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const result = await repository.upsert(exerciseData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-upsert-1');
      expect(result.name).toBe('Upsert Test Exercise');
      expect(result.version).toBe(1);
      expect(result.updatedAt).toBeDefined();

      // Verify it was inserted
      const found = await repository.findById('ex-upsert-1');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Upsert Test Exercise');
    });

    it('should update existing exercise and increment version', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-upsert-2',
        name: 'Original Name',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Original instruction'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const created = await repository.create(exerciseData);
      expect(created.version).toBe(1);
      expect(created.updatedAt).toBeDefined();

      const updatedData: CompendiumExercise = {
        templateId: 'ex-upsert-2',
        name: 'Updated Name',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PULL],
        primaryMuscles: [Muscle.LATS],
        secondaryMuscles: [Muscle.BICEPS],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['dumbbell'],
        bodyWeightScaling: 0.5,
        instructions: ['Updated instruction'],
        images: [],
        createdBy: 'user-2',
        description: 'Updated description',
        version: 2,
      };

      const result = await repository.upsert(updatedData);

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-upsert-2');
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Updated description');
      expect(result.version).toBe(2); // Version incremented
      expect(result.updatedAt).toBeDefined(); // Updated timestamp set

      // Verify only one record exists
      const allExercises = await repository.findAll();
      expect(allExercises).toHaveLength(1);
    });

    it('should handle multiple upserts and increment version each time', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-upsert-3',
        name: 'Multi Upsert',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      // First upsert - insert
      const result1 = await repository.upsert(exerciseData);
      expect(result1.version).toBe(1);
      expect(result1.updatedAt).toBeDefined();

      // Second upsert - update
      const result2 = await repository.upsert({
        ...exerciseData,
        description: 'First update',
      });
      expect(result2.version).toBe(2);
      expect(result2.updatedAt).toBeDefined();
      expect(result2.description).toBe('First update');

      // Third upsert - another update
      const result3 = await repository.upsert({
        ...exerciseData,
        description: 'Second update',
        technicalDifficulty: TechnicalDifficulty.ADVANCED,
      });
      expect(result3.version).toBe(3);
      expect(result3.updatedAt).toBeDefined();
      expect(result3.description).toBe('Second update');
      expect(result3.technicalDifficulty).toBe(TechnicalDifficulty.ADVANCED);

      // Verify still only one record
      const allExercises = await repository.findAll();
      expect(allExercises).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete exercise by id', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'To Be Deleted',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Delete me'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);

      const result = await repository.delete('ex-1');

      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-1');

      // Verify it's actually deleted
      const found = await repository.findById('ex-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent exercise', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should delete and allow recreation with new id', async () => {
      const exerciseData: CompendiumExercise = {
        templateId: 'ex-1',
        name: 'Reusable',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      await repository.create(exerciseData);
      await repository.delete('ex-1');

      // Should be able to create new exercise
      const newExerciseData: CompendiumExercise = {
        templateId: 'ex-2',
        name: 'New Exercise',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        images: [],
        createdBy: 'user-1',
        version: 1,
      };

      const result = await repository.create(newExerciseData);
      expect(result).toBeDefined();
      expect(result.templateId).toBe('ex-2');
    });

  });
});
