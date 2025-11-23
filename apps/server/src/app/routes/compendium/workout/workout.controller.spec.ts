import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutController } from './workout.controller';
import { CompendiumWorkoutService } from '../../../core/compendium/workout/compendium-workout.service';
import type { CreateWorkoutDto } from './dto/workout.dto';
import { WorkoutSectionType } from '../../../core/persistence/schemas/compendium-workout-section.schema';

describe('WorkoutController', () => {
  let controller: WorkoutController;
  let service: CompendiumWorkoutService;

  const mockService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutController],
      providers: [
        {
          provide: CompendiumWorkoutService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<WorkoutController>(WorkoutController);
    service = module.get<CompendiumWorkoutService>(CompendiumWorkoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call service.findAll and return all workouts', async () => {
      const mockWorkouts = [
        {
          templateId: 'workout-1',
          name: 'Full Body Workout',
          description: 'A comprehensive workout',
          version: 1,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-01'),
          updatedAt: null,
        },
        {
          templateId: 'workout-2',
          name: 'Upper Body Workout',
          description: null,
          version: 1,
          createdBy: 'user-1',
          createdAt: new Date('2024-01-02'),
          updatedAt: null,
        },
      ];

      mockService.findAll.mockResolvedValue(mockWorkouts);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('templateId', 'workout-1');
      expect(result[1]).toHaveProperty('templateId', 'workout-2');
    });

    it('should return empty array when no workouts exist', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should call service.findById with templateId and return workout', async () => {
      const mockWorkout = {
        templateId: 'workout-1',
        name: 'Test Workout',
        description: 'Test description',
        version: 1,
        sections: [
          {
            id: 'section-1',
            workoutTemplateId: 'workout-1',
            type: WorkoutSectionType.STRENGTH,
            name: 'Main Section',
            orderIndex: 0,
            items: [],
            createdBy: 'user-1',
            createdAt: new Date('2024-01-01'),
          },
        ],
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
      };

      mockService.findById.mockResolvedValue(mockWorkout);

      const result = await controller.findById('workout-1');

      expect(service.findById).toHaveBeenCalledWith('workout-1');
      expect(service.findById).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('templateId', 'workout-1');
      expect(result.sections).toHaveLength(1);
    });

    it('should return null when workout does not exist', async () => {
      mockService.findById.mockResolvedValue(null);

      const result = await controller.findById('nonexistent');

      expect(service.findById).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should call service.create with dto and userId', async () => {
      const createDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'New Workout',
        description: 'A new workout',
        version: 1,
        sections: [
          {
            type: WorkoutSectionType.WARMUP,
            name: 'Warmup',
            orderIndex: 0,
            items: [
              {
                exerciseSchemeId: 'scheme-1',
                orderIndex: 0,
                breakBetweenSets: 30,
                breakAfter: 60,
              },
            ],
          },
        ],
      };

      const mockCreatedWorkout = {
        templateId: 'workout-1',
        name: 'New Workout',
        description: 'A new workout',
        version: 1,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
      };

      mockService.create.mockResolvedValue(mockCreatedWorkout);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('templateId', 'workout-1');
      expect(result).toHaveProperty('createdBy', 'user-1');
    });

    it('should handle creating workout with minimal data', async () => {
      const createDto: CreateWorkoutDto = {
        templateId: 'workout-2',
        name: 'Simple Workout',
        version: 1,
        sections: [],
      };

      const mockCreatedWorkout = {
        templateId: 'workout-2',
        name: 'Simple Workout',
        description: null,
        version: 1,
        createdBy: 'user-2',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
      };

      mockService.create.mockResolvedValue(mockCreatedWorkout);

      const result = await controller.create(createDto, 'user-2');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-2');
      expect(result).toHaveProperty('templateId', 'workout-2');
      expect(result.description).toBeNull();
    });

    it('should handle creating workout with all section types', async () => {
      const createDto: CreateWorkoutDto = {
        templateId: 'workout-3',
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
      };

      const mockCreatedWorkout = {
        templateId: 'workout-3',
        name: 'Complete Workout',
        description: null,
        version: 1,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
      };

      mockService.create.mockResolvedValue(mockCreatedWorkout);

      const result = await controller.create(createDto, 'user-1');

      expect(service.create).toHaveBeenCalledWith(createDto, 'user-1');
      expect(result).toHaveProperty('templateId', 'workout-3');
    });
  });

  describe('update', () => {
    it('should call service.update with templateId, dto, and userId', async () => {
      const updateDto: CreateWorkoutDto = {
        templateId: 'workout-1',
        name: 'Updated Name',
        description: 'Updated description',
        version: 2,
        sections: [],
      };

      const mockUpdatedWorkout = {
        templateId: 'workout-1',
        name: 'Updated Name',
        description: 'Updated description',
        version: 2,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockService.update.mockResolvedValue(mockUpdatedWorkout);

      const result = await controller.update('workout-1', updateDto, 'user-1');

      expect(service.update).toHaveBeenCalledWith('workout-1', updateDto, 'user-1');
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('name', 'Updated Name');
      expect(result).toHaveProperty('version', 2);
      expect(result.updatedAt).toBeDefined();
    });

    it('should handle partial updates', async () => {
      const updateDto = {
        name: 'New Name Only',
      };

      const mockUpdatedWorkout = {
        templateId: 'workout-1',
        name: 'New Name Only',
        description: 'Original description',
        version: 1,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockService.update.mockResolvedValue(mockUpdatedWorkout);

      const result = await controller.update('workout-1', updateDto as any, 'user-1');

      expect(service.update).toHaveBeenCalledWith('workout-1', updateDto, 'user-1');
      expect(result).toHaveProperty('name', 'New Name Only');
    });
  });

  describe('delete', () => {
    it('should call service.delete with templateId', async () => {
      const mockDeletedWorkout = {
        templateId: 'workout-1',
        name: 'Deleted Workout',
        description: null,
        version: 1,
        createdBy: 'user-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: null,
      };

      mockService.delete.mockResolvedValue(mockDeletedWorkout);

      const result = await controller.delete('workout-1', 'user-1');

      expect(service.delete).toHaveBeenCalledWith('workout-1');
      expect(service.delete).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty('templateId', 'workout-1');
    });

    it('should handle deleting non-existent workout', async () => {
      mockService.delete.mockResolvedValue(undefined);

      const result = await controller.delete('nonexistent', 'user-1');

      expect(service.delete).toHaveBeenCalledWith('nonexistent');
      expect(result).toBeUndefined();
    });
  });
});
