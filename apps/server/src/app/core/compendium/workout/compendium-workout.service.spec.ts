import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutService } from './compendium-workout.service';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { UserExerciseSchemeCompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/user-exercise-scheme-compendium-workout-section-item.repository';
import { UserExerciseSchemeRepository } from '../../persistence/repositories/user-exercise-scheme.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise, mockUserExerciseScheme } from '../../persistence/test-factories';
import type { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import { WorkoutSectionType } from '../../persistence/schemas/compendium-workout-section.schema';

describe('CompendiumWorkoutService', () => {
  let service: CompendiumWorkoutService;
  let workoutRepository: CompendiumWorkoutRepository;
  let sectionRepository: CompendiumWorkoutSectionRepository;
  let sectionItemRepository: CompendiumWorkoutSectionItemRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let schemeRepository: UserExerciseSchemeRepository;
  let testScheme1Id: string;
  let testScheme2Id: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumWorkoutRepository,
        CompendiumWorkoutSectionRepository,
        CompendiumWorkoutSectionItemRepository,
        UserExerciseSchemeCompendiumWorkoutSectionItemRepository,
        UserExerciseSchemeRepository,
        CompendiumExerciseRepository,
        CompendiumWorkoutService,
      ],
    }).compile();

    service = module.get<CompendiumWorkoutService>(CompendiumWorkoutService);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
    sectionRepository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    sectionItemRepository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
    schemeRepository = module.get<UserExerciseSchemeRepository>(UserExerciseSchemeRepository);

    // Create prerequisite test data
    const exercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    const exercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
    const scheme1 = await schemeRepository.create(mockUserExerciseScheme({ userId: 'test-user', exerciseId: exercise1.templateId }));
    const scheme2 = await schemeRepository.create(mockUserExerciseScheme({ userId: 'test-user', exerciseId: exercise2.templateId }));
    testScheme1Id = scheme1.id;
    testScheme2Id = scheme2.id;
  });

  describe('create', () => {
    it('should create a complete workout with sections and items', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                breakBetweenSets: 30,
                breakAfter: 60,
              },
            ],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength Training',
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                breakBetweenSets: 90,
                breakAfter: 120,
              },
              {
                exerciseSchemeId: testScheme2Id,
                breakBetweenSets: 90,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        createdBy: 'user-1',
      });

      // Verify sections were created
      const sections = await sectionRepository.findByWorkoutTemplateId(result.templateId);
      expect(sections).toHaveLength(2);
      expect(sections[0].type).toBe(WorkoutSectionType.WARMUP);
      expect(sections[1].type).toBe(WorkoutSectionType.STRENGTH);

      // Verify items were created
      const warmupItems = await sectionItemRepository.findBySectionId(sections[0].id);
      expect(warmupItems).toHaveLength(1);
      const strengthItems = await sectionItemRepository.findBySectionId(sections[1].id);
      expect(strengthItems).toHaveLength(2);
    });

    it('should create a workout with minimal data (no description)', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
        sections: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
      });
      expect(result.description).toBeNull();
    });

    it('should create a workout with empty sections', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-3',
        name: 'Empty Workout',
        version: 1,
        sections: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      const sections = await sectionRepository.findByWorkoutTemplateId(result.templateId);
      expect(sections).toHaveLength(0);
    });

    it('should create a workout with all section types', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-4',
        name: 'Complete Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            items: [],
          },
          {
            type: WorkoutSectionType.STRETCHING,
            name: 'Stretching',
            items: [],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength',
            items: [],
          },
          {
            type: WorkoutSectionType.COOLDOWN,
            name: 'Cooldown',
            items: [],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');

      const sections = await sectionRepository.findByWorkoutTemplateId('workout-4');
      expect(sections).toHaveLength(4);
      expect(sections.map((s) => s.type)).toEqual([
        WorkoutSectionType.WARMUP,
        WorkoutSectionType.STRETCHING,
        WorkoutSectionType.STRENGTH,
        WorkoutSectionType.COOLDOWN,
      ]);
    });

  });

  describe('findAll', () => {
    it('should return empty array when no workouts exist', async () => {
      const results = await service.findAll();
      expect(results).toEqual([]);
    });

    it('should return all workouts', async () => {
      await workoutRepository.create({
        templateId: 'workout-1',
        name: 'Workout A',
        version: 1,
        createdBy: 'user-1',
      });
      await workoutRepository.create({
        templateId: 'workout-2',
        name: 'Workout B',
        version: 1,
        createdBy: 'user-1',
      });

      const results = await service.findAll();

      expect(results).toHaveLength(2);
      expect(results.map((w) => w.name)).toEqual(expect.arrayContaining(['Workout A', 'Workout B']));
    });
  });

  describe('findById', () => {
    it('should find a workout with all nested data', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Test Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');

      const result = await service.findById('workout-1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Workout');
      expect(result?.sections).toHaveLength(1);
      expect(result?.sections[0].items).toHaveLength(1);
    });

    it('should return null when workout does not exist', async () => {
      const result = await service.findById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update workout name', async () => {
      await workoutRepository.create({
        templateId: 'workout-1',
        name: 'Old Name',
        version: 1,
        createdBy: 'user-1',
      });

      const result = await service.update('workout-1', { name: 'New Name' }, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-1',
        name: 'New Name',
      });
    });

    it('should update workout description', async () => {
      await workoutRepository.create({
        templateId: 'workout-1',
        name: 'Test Workout',
        description: 'Old description',
        version: 1,
        createdBy: 'user-1',
      });

      const result = await service.update('workout-1', { description: 'New description' }, 'user-1');

      expect(result?.description).toBe('New description');
    });

    it('should update version number', async () => {
      await workoutRepository.create({
        templateId: 'workout-1',
        name: 'Test Workout',
        version: 1,
        createdBy: 'user-1',
      });

      const result = await service.update('workout-1', { version: 2 }, 'user-1');

      expect(result?.version).toBe(2);
      expect(result?.updatedAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a workout and all its nested data', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Test Workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
      };

      await service.create(workoutDto, 'user-1');

      const result = await service.delete('workout-1');

      expect(result).toMatchObject({ templateId: 'workout-1' });

      // Verify cascade delete
      const found = await workoutRepository.findById('workout-1');
      expect(found).toBeUndefined();

      const sections = await sectionRepository.findByWorkoutTemplateId('workout-1');
      expect(sections).toHaveLength(0);
    });
  });
});
