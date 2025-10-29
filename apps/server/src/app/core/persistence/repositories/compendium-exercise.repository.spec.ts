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
        id: 'ex-1',
        name: 'Bench Press',
        slug: 'bench-press',
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
      };

      const result = await repository.create(exerciseData);

      expect(result).toBeDefined();
      expect(result.id).toBe(exerciseData.id);
      expect(result.name).toBe(exerciseData.name);
      expect(result.slug).toBe(exerciseData.slug);
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
      expect(result.updatedAt).toBeNull();
      expect(result.version).toBe(1);
    });

    it('should create exercise with minimal required fields', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-2',
        name: 'Push Up',
        slug: 'push-up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Get in plank position', 'Lower body', 'Push up'],
        createdBy: 'user-1',
      };

      const result = await repository.create(exerciseData);

      expect(result).toBeDefined();
      expect(result.id).toBe(exerciseData.id);
      expect(result.name).toBe(exerciseData.name);
      expect(result.description).toBeNull();
      expect(result.authorName).toBeNull();
      expect(result.parentExerciseId).toBeNull();
    });

    it('should create exercise with parent exercise reference', async () => {
      // Create parent exercise first
      const parentExercise: CompendiumExercise = {
        id: 'parent-ex-1',
        name: 'Standard Squat',
        slug: 'standard-squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [Muscle.GLUTES],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Stand with bar', 'Lower down', 'Stand up'],
        createdBy: 'user-1',
      };

      await repository.create(parentExercise);

      // Create variant exercise
      const variantExercise: CompendiumExercise = {
        id: 'variant-ex-1',
        name: 'Front Squat',
        slug: 'front-squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [Muscle.GLUTES],
        technicalDifficulty: TechnicalDifficulty.ADVANCED,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Hold bar in front', 'Lower down', 'Stand up'],
        createdBy: 'user-1',
        parentExerciseId: 'parent-ex-1',
      };

      const result = await repository.create(variantExercise);

      expect(result).toBeDefined();
      expect(result.parentExerciseId).toBe('parent-ex-1');
    });

    it('should fail when creating exercise with duplicate id', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-3',
        name: 'Deadlift',
        slug: 'deadlift',
        type: ExerciseType.STRENGTH,
        force: [ForceType.HINGE],
        primaryMuscles: [Muscle.LOWER_BACK],
        secondaryMuscles: [Muscle.GLUTES, Muscle.HAMSTRINGS],
        technicalDifficulty: TechnicalDifficulty.ADVANCED,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Lift bar from ground'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const duplicateData: CompendiumExercise = {
        ...exerciseData,
        slug: 'different-slug',
        name: 'Different Name',
      };

      await expect(repository.create(duplicateData)).rejects.toThrow();
    });

    it('should fail when creating exercise with duplicate slug', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-4',
        name: 'Pull Up',
        slug: 'pull-up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PULL],
        primaryMuscles: [Muscle.LATS],
        secondaryMuscles: [Muscle.BICEPS],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['pull-up-bar'],
        bodyWeightScaling: 1,
        instructions: ['Hang from bar', 'Pull up', 'Lower down'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const duplicateData: CompendiumExercise = {
        ...exerciseData,
        id: 'ex-5',
        name: 'Different Name',
        // Same slug
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
        id: 'ex-1',
        name: 'Squat',
        slug: 'squat',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: ['barbell'],
        bodyWeightScaling: 0,
        instructions: ['Stand with bar', 'Lower', 'Stand up'],
        createdBy: 'user-1',
      };

      const exercise2: CompendiumExercise = {
        id: 'ex-2',
        name: 'Running',
        slug: 'running',
        type: ExerciseType.CARDIO,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.QUADS, Muscle.CALVES],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Run at steady pace'],
        createdBy: 'user-1',
      };

      await repository.create(exercise1);
      await repository.create(exercise2);

      const result = await repository.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].slug).toBe('squat');
      expect(result[1].slug).toBe('running');
    });
  });

  describe('findById', () => {
    it('should find exercise by id', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'Plank',
        slug: 'plank',
        type: ExerciseType.STRENGTH,
        force: [ForceType.STATIC],
        primaryMuscles: [Muscle.ABS],
        secondaryMuscles: [Muscle.LOWER_BACK],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Hold plank position'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const result = await repository.findById('ex-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('ex-1');
      expect(result.name).toBe('Plank');
      expect(result.slug).toBe('plank');
    });

    it('should return undefined when exercise not found', async () => {
      const result = await repository.findById('non-existent-id');
      expect(result).toBeUndefined();
    });
  });

  describe('findBySlug', () => {
    it('should find exercise by slug', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'Bicep Curl',
        slug: 'bicep-curl',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PULL],
        primaryMuscles: [Muscle.BICEPS],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: ['dumbbell'],
        bodyWeightScaling: 0,
        instructions: ['Curl weight up', 'Lower slowly'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const result = await repository.findBySlug('bicep-curl');

      expect(result).toBeDefined();
      expect(result.slug).toBe('bicep-curl');
      expect(result.id).toBe('ex-1');
    });

    it('should return undefined when exercise not found by slug', async () => {
      const result = await repository.findBySlug('non-existent-slug');
      expect(result).toBeUndefined();
    });
  });

  describe('findByParentId', () => {
    it('should find all child exercises by parent id', async () => {
      // Create parent exercise
      const parentExercise: CompendiumExercise = {
        id: 'parent-1',
        name: 'Standard Push Up',
        slug: 'standard-push-up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [Muscle.TRICEPS],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Do push up'],
        createdBy: 'user-1',
      };

      await repository.create(parentExercise);

      // Create child exercises
      const variant1: CompendiumExercise = {
        id: 'variant-1',
        name: 'Diamond Push Up',
        slug: 'diamond-push-up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.TRICEPS],
        secondaryMuscles: [Muscle.CHEST],
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Push up with hands together'],
        createdBy: 'user-1',
        parentExerciseId: 'parent-1',
      };

      const variant2: CompendiumExercise = {
        id: 'variant-2',
        name: 'Wide Push Up',
        slug: 'wide-push-up',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [Muscle.FRONT_DELTS],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 1,
        instructions: ['Push up with wide hands'],
        createdBy: 'user-1',
        parentExerciseId: 'parent-1',
      };

      await repository.create(variant1);
      await repository.create(variant2);

      const result = await repository.findByParentId('parent-1');

      expect(result).toHaveLength(2);
      expect(result.every((ex) => ex.parentExerciseId === 'parent-1')).toBe(true);
    });

    it('should return empty array when no child exercises exist', async () => {
      const result = await repository.findByParentId('parent-1');
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update exercise fields', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'Rowing',
        slug: 'rowing',
        type: ExerciseType.CARDIO,
        force: [ForceType.PULL],
        primaryMuscles: [Muscle.LATS],
        secondaryMuscles: [Muscle.BICEPS],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: ['rowing-machine'],
        bodyWeightScaling: 0,
        instructions: ['Row steadily'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const updateData = {
        description: 'A great full-body cardio exercise',
        technicalDifficulty: TechnicalDifficulty.INTERMEDIATE,
        secondaryMuscles: [Muscle.BICEPS, Muscle.LOWER_BACK],
      };

      const result = await repository.update('ex-1', updateData);

      expect(result).toBeDefined();
      expect(result.id).toBe('ex-1');
      expect(result.name).toBe('Rowing'); // Unchanged
      expect(result.description).toBe('A great full-body cardio exercise'); // Updated
      expect(result.technicalDifficulty).toBe(TechnicalDifficulty.INTERMEDIATE); // Updated
      expect(result.secondaryMuscles).toEqual([Muscle.BICEPS, Muscle.LOWER_BACK]); // Updated
      expect(result.updatedAt).toBeDefined();
      expect(result.version).toBe(2); // Version incremented
    });

    it('should increment version on each update', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'Test Exercise',
        slug: 'test-exercise',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        createdBy: 'user-1',
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
        id: 'ex-1',
        name: 'Test',
        slug: 'test',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        description: 'Some description',
        authorName: 'Author',
        createdBy: 'user-1',
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

  describe('delete', () => {
    it('should delete exercise by id', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'To Be Deleted',
        slug: 'to-be-deleted',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Delete me'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);

      const result = await repository.delete('ex-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('ex-1');

      // Verify it's actually deleted
      const found = await repository.findById('ex-1');
      expect(found).toBeUndefined();
    });

    it('should return undefined when deleting non-existent exercise', async () => {
      const result = await repository.delete('non-existent-id');
      expect(result).toBeUndefined();
    });

    it('should delete and allow recreation with same slug', async () => {
      const exerciseData: CompendiumExercise = {
        id: 'ex-1',
        name: 'Reusable',
        slug: 'reusable-slug',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        createdBy: 'user-1',
      };

      await repository.create(exerciseData);
      await repository.delete('ex-1');

      // Should be able to create new exercise with same slug
      const newExerciseData: CompendiumExercise = {
        id: 'ex-2',
        name: 'New Exercise',
        slug: 'reusable-slug',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        createdBy: 'user-1',
      };

      const result = await repository.create(newExerciseData);
      expect(result).toBeDefined();
      expect(result.id).toBe('ex-2');
    });

    it('should fail to delete parent when children exist (foreign key constraint)', async () => {
      // Create parent
      const parentExercise: CompendiumExercise = {
        id: 'parent-1',
        name: 'Parent',
        slug: 'parent',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        createdBy: 'user-1',
      };

      await repository.create(parentExercise);

      // Create child
      const childExercise: CompendiumExercise = {
        id: 'child-1',
        name: 'Child',
        slug: 'child',
        type: ExerciseType.STRENGTH,
        force: [ForceType.PUSH],
        primaryMuscles: [Muscle.CHEST],
        secondaryMuscles: [],
        technicalDifficulty: TechnicalDifficulty.BEGINNER,
        equipmentIds: [],
        bodyWeightScaling: 0,
        instructions: ['Test'],
        createdBy: 'user-1',
        parentExerciseId: 'parent-1',
      };

      await repository.create(childExercise);

      // Attempting to delete parent should fail due to foreign key constraint
      await expect(repository.delete('parent-1')).rejects.toThrow();

      // Parent should still exist
      const parent = await repository.findById('parent-1');
      expect(parent).toBeDefined();

      // Child should still exist
      const child = await repository.findById('child-1');
      expect(child).toBeDefined();
      expect(child.parentExerciseId).toBe('parent-1');
    });
  });
});
