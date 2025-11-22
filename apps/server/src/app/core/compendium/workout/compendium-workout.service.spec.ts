import { Test, TestingModule } from '@nestjs/testing';
import { CompendiumWorkoutService } from './compendium-workout.service';
import { CompendiumWorkoutRepository } from '../../persistence/repositories/compendium-workout.repository';
import { CompendiumWorkoutSectionRepository } from '../../persistence/repositories/compendium-workout-section.repository';
import { CompendiumWorkoutSectionItemRepository } from '../../persistence/repositories/compendium-workout-section-item.repository';
import { CompendiumWorkoutScheduleRepository } from '../../persistence/repositories/compendium-workout-schedule.repository';
import { CompendiumExerciseSchemeRepository } from '../../persistence/repositories/compendium-exercise-scheme.repository';
import { CompendiumExerciseRepository } from '../../persistence/repositories/compendium-exercise.repository';
import { provideTestDatabase } from '../../persistence/database';
import { mockExercise, mockExerciseScheme } from '../../persistence/test-factories';
import type { CreateWorkoutDto } from '../../../routes/compendium/workout/dto/workout.dto';
import { WorkoutSectionType } from '../../persistence/schemas/compendium-workout-section.schema';

describe('CompendiumWorkoutService', () => {
  let service: CompendiumWorkoutService;
  let workoutRepository: CompendiumWorkoutRepository;
  let sectionRepository: CompendiumWorkoutSectionRepository;
  let sectionItemRepository: CompendiumWorkoutSectionItemRepository;
  let scheduleRepository: CompendiumWorkoutScheduleRepository;
  let exerciseRepository: CompendiumExerciseRepository;
  let schemeRepository: CompendiumExerciseSchemeRepository;
  let testScheme1Id: string;
  let testScheme2Id: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        provideTestDatabase(),
        CompendiumWorkoutRepository,
        CompendiumWorkoutSectionRepository,
        CompendiumWorkoutSectionItemRepository,
        CompendiumWorkoutScheduleRepository,
        CompendiumExerciseSchemeRepository,
        CompendiumExerciseRepository,
        CompendiumWorkoutService,
      ],
    }).compile();

    service = module.get<CompendiumWorkoutService>(CompendiumWorkoutService);
    workoutRepository = module.get<CompendiumWorkoutRepository>(CompendiumWorkoutRepository);
    sectionRepository = module.get<CompendiumWorkoutSectionRepository>(CompendiumWorkoutSectionRepository);
    sectionItemRepository = module.get<CompendiumWorkoutSectionItemRepository>(CompendiumWorkoutSectionItemRepository);
    scheduleRepository = module.get<CompendiumWorkoutScheduleRepository>(CompendiumWorkoutScheduleRepository);
    exerciseRepository = module.get<CompendiumExerciseRepository>(CompendiumExerciseRepository);
    schemeRepository = module.get<CompendiumExerciseSchemeRepository>(CompendiumExerciseSchemeRepository);

    // Create prerequisite test data
    const exercise1 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-1' }));
    const exercise2 = await exerciseRepository.create(mockExercise({ templateId: 'exercise-2' }));
    const scheme1 = await schemeRepository.create(mockExerciseScheme({ exerciseId: exercise1.templateId }));
    const scheme2 = await schemeRepository.create(mockExerciseScheme({ exerciseId: exercise2.templateId }));
    testScheme1Id = scheme1.id;
    testScheme2Id = scheme2.id;
  });

  describe('create', () => {
    it('should create a complete workout with sections, items, and schedule', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Full Body Workout',
        description: 'A comprehensive full body workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            orderIndex: 0,
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                orderIndex: 0,
                breakBetweenSets: 30,
                breakAfter: 60,
              },
            ],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength Training',
            orderIndex: 1,
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                orderIndex: 0,
                breakBetweenSets: 90,
                breakAfter: 120,
              },
              {
                exerciseSchemeId: testScheme2Id,
                orderIndex: 1,
                breakBetweenSets: 90,
                breakAfter: 120,
              },
            ],
          },
        ],
        schedule: [1, 3, 5], // Mon, Wed, Fri
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

      // Verify schedule was created
      const schedule = await scheduleRepository.findByWorkoutTemplateId(result.templateId);
      expect(schedule).toHaveLength(3);
      expect(schedule.map((s) => s.dayOfWeek).sort()).toEqual([1, 3, 5]);
    });

    it('should create a workout with minimal data (no description)', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
        sections: [],
        schedule: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      expect(result).toMatchObject({
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
      });
      expect(result.description).toBeNull();
    });

    it('should create a workout with empty sections and schedule', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-3',
        name: 'Empty Workout',
        version: 1,
        sections: [],
        schedule: [],
      };

      const result = await service.create(workoutDto, 'user-1');

      const sections = await sectionRepository.findByWorkoutTemplateId(result.templateId);
      expect(sections).toHaveLength(0);

      const schedule = await scheduleRepository.findByWorkoutTemplateId(result.templateId);
      expect(schedule).toHaveLength(0);
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
            orderIndex: 0,
            items: [],
          },
          {
            type: WorkoutSectionType.STRETCHING,
            name: 'Stretching',
            orderIndex: 1,
            items: [],
          },
          {
            type: WorkoutSectionType.STRENGTH,
            name: 'Strength',
            orderIndex: 2,
            items: [],
          },
          {
            type: WorkoutSectionType.COOLDOWN,
            name: 'Cooldown',
            orderIndex: 3,
            items: [],
          },
        ],
        schedule: [],
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

    it('should create a workout scheduled for every day of the week', async () => {
      const workoutDto: CreateWorkoutDto = {
        templateId: 'workout-5',
        name: 'Daily Workout',
        version: 1,
        sections: [],
        schedule: [0, 1, 2, 3, 4, 5, 6], // Sun-Sat
      };

      const result = await service.create(workoutDto, 'user-1');

      const schedule = await scheduleRepository.findByWorkoutTemplateId(result.templateId);
      expect(schedule).toHaveLength(7);
      expect(schedule.map((s) => s.dayOfWeek).sort()).toEqual([0, 1, 2, 3, 4, 5, 6]);
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
            orderIndex: 0,
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                orderIndex: 0,
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
        schedule: [1, 3, 5],
      };

      await service.create(workoutDto, 'user-1');

      const result = await service.findById('workout-1');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Test Workout');
      expect(result?.sections).toHaveLength(1);
      expect(result?.sections[0].items).toHaveLength(1);
      expect(result?.schedule).toEqual([1, 3, 5]);
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
            orderIndex: 0,
            items: [
              {
                exerciseSchemeId: testScheme1Id,
                orderIndex: 0,
                breakBetweenSets: 60,
                breakAfter: 120,
              },
            ],
          },
        ],
        schedule: [1, 3, 5],
      };

      await service.create(workoutDto, 'user-1');

      const result = await service.delete('workout-1');

      expect(result).toMatchObject({ templateId: 'workout-1' });

      // Verify cascade delete
      const found = await workoutRepository.findById('workout-1');
      expect(found).toBeUndefined();

      const sections = await sectionRepository.findByWorkoutTemplateId('workout-1');
      expect(sections).toHaveLength(0);

      const schedule = await scheduleRepository.findByWorkoutTemplateId('workout-1');
      expect(schedule).toHaveLength(0);
    });
  });
});
